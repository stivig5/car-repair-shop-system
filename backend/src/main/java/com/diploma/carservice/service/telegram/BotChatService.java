package com.diploma.carservice.service.telegram;

import com.diploma.carservice.entity.Order;
import com.diploma.carservice.entity.User;
import com.diploma.carservice.entity.enums.UserRole;
import com.diploma.carservice.repository.OrderRepository;
import com.diploma.carservice.repository.UserRepository;
import com.diploma.carservice.service.telegram.model.ChatSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.bots.AbsSender;

import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class BotChatService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final BotMenuService menuService;

    private final Map<Long, ChatSession> activeSessions = new ConcurrentHashMap<>();

    public boolean isChatActive(Long chatId) {
        return activeSessions.containsKey(chatId);
    }

    public ChatSession getSession(Long chatId) {
        return activeSessions.get(chatId);
    }

    public void startChat(Long chatId, ChatSession.ChatType type, Long entityId, AbsSender sender) {
        activeSessions.put(chatId, new ChatSession(type, entityId));

        ReplyKeyboardMarkup markup = new ReplyKeyboardMarkup();
        KeyboardRow row = new KeyboardRow();
        row.add("❌ Zakończ rozmowę");
        markup.setKeyboard(Collections.singletonList(row));
        markup.setResizeKeyboard(true);

        String contextName = (type == ChatSession.ChatType.ORDER) ? "Zlecenia #" : "Temat #";
        sendMessage(sender, chatId, "💬 Rozpoczęto czat dot. " + contextName + entityId, markup);
    }

    public void handleChatMessage(Update update, AbsSender sender) {
        Long senderChatId = update.getMessage().getChatId();
        String text = update.getMessage().getText();

        if ("❌ Zakończ rozmowę".equals(text)) {
            endChat(senderChatId, sender);
            return;
        }

        ChatSession session = activeSessions.get(senderChatId);
        if (session == null) {
            sendMessage(sender, senderChatId, "⚠️ Sesja wygasła.", null);
            return;
        }

        User senderUser = findUserByChatId(senderChatId);
        if (senderUser == null) return;

        if (session.getType() == ChatSession.ChatType.ORDER) {
            handleOrderMessage(session.getEntityId(), senderUser, text, sender);
        } else {
            log.warn("BotChatService otrzymał wiadomość dla typu: {}", session.getType());
        }
    }

    private void handleOrderMessage(Long orderId, User sender, String text, AbsSender bot) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return;

        User recipient = (sender.getUserRole() == UserRole.MECHANIC)
                ? order.getCar().getOwner()
                : order.getMechanic();

        String carInfo = (order.getCar() != null)
                ? order.getCar().getBrand() + " " + order.getCar().getModel()
                : "Auto";

        String context = "Zlecenie #" + orderId + " (" + carInfo + ")";

        sendToRecipient(recipient, sender, context, text, bot);
    }

    private void sendToRecipient(User recipient, User sender, String context, String text, AbsSender bot) {
        if (recipient != null && recipient.getTelegramChatId() != null) {
            String roleLabel = (sender.getUserRole() == UserRole.MECHANIC) ? "👨‍🔧 Mechanik" : "👤 Klient";

            String msg = String.format("""
                    📩 <b>Nowa wiadomość</b>
                    Od: %s (%s)
                    Dotyczy: %s
                    
                    "%s"
                    """,
                    sender.getFullName(), roleLabel, context, text);

            sendMessage(bot, recipient.getTelegramChatId(), msg, null);
        }
    }

    public void endChat(Long chatId, AbsSender sender) {
        activeSessions.remove(chatId);
        menuService.showMainMenu(chatId, sender);
    }

    private User findUserByChatId(Long chatId) {
        return userRepository.findAll().stream()
                .filter(u -> u.getTelegramChatId() != null && u.getTelegramChatId().equals(chatId))
                .findFirst().orElse(null);
    }

    private void sendMessage(AbsSender sender, Long chatId, String text, ReplyKeyboardMarkup markup) {
        SendMessage msg = new SendMessage(chatId.toString(), text);
        msg.setParseMode("HTML");
        if (markup != null) msg.setReplyMarkup(markup);
        try { sender.execute(msg); } catch (Exception e) {}
    }
}