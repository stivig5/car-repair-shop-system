package com.diploma.carservice.service.telegram;

import com.diploma.carservice.repository.UserRepository;
import com.diploma.carservice.service.telegram.model.ChatSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

@Slf4j
@Service
@RequiredArgsConstructor
public class TelegramBotService extends TelegramLongPollingBot {

    private final BotConfig botConfig;
    private final BotMenuService menuService;
    private final BotOrderService orderService;
    private final BotChatService chatService;
    private final UserRepository userRepository;
    private final BotAppointmentService appointmentService;

    @Override
    public String getBotUsername() { return botConfig.getBotName(); }
    @Override
    public String getBotToken() { return botConfig.getToken(); }

    @Override
    public void onUpdateReceived(Update update) {
        try {
            if (update.hasCallbackQuery()) {
                handleCallback(update);
            } else if (update.hasMessage()) {
                handleMessage(update);
            }
        } catch (Exception e) {
            log.error("Error in onUpdateReceived", e);
        }
    }

    private void handleMessage(Update update) {
        Long chatId = update.getMessage().getChatId();

        if (update.getMessage().hasContact()) {
            menuService.handleContact(chatId, update.getMessage().getContact(), this);
            return;
        }

        if (!update.getMessage().hasText()) return;
        String text = update.getMessage().getText();

        if (chatService.isChatActive(chatId)) {
            ChatSession session = chatService.getSession(chatId);

            if (session.getType() == ChatSession.ChatType.ORDER) {
                chatService.handleChatMessage(update, this);
            }
            else if (session.getType() == ChatSession.ChatType.APP_WAITING_DATE) {
                appointmentService.processDateInput(chatId, text, session.getEntityId(), this);
            }
            else if (session.getType() == ChatSession.ChatType.APP_WAITING_DESC) {
                appointmentService.processDescriptionInput(chatId, text, session.getEntityId(), this);
            }
            return;
        }

        switch (text) {
            case "/start":
                menuService.showMainMenu(chatId, this);
                break;
            case "🔧 Moje Zlecenia":
            case "🚗 Moje Naprawy":
                orderService.handleOrderList(chatId, this);
                break;
            case "📅 Moje Wizyty":
                appointmentService.showMyAppointments(chatId, this);
                break;
            default:
                menuService.showMainMenu(chatId, this);
        }
    }

    private void handleCallback(Update update) {
        String data = update.getCallbackQuery().getData();
        Long chatId = update.getCallbackQuery().getMessage().getChatId();

        if (data.startsWith("APP_")) {
            appointmentService.handleCallback(chatId, data, this);
        } else if (data.startsWith("DETAILS") || data.startsWith("STATUS") || data.startsWith("SETSTATUS")) {
            orderService.handleCallback(chatId, data, this);
        } else if (data.startsWith("CHAT_")) {
            Long orderId = Long.parseLong(data.split("_")[1]);
            chatService.startChat(chatId, ChatSession.ChatType.ORDER, orderId, this);
        }
    }

    public void sendDirectMessage(String chatIdStr, String text) {
        if (chatIdStr == null) return;
        SendMessage message = new SendMessage(chatIdStr, text);
        message.setParseMode("HTML");
        try { execute(message); } catch (TelegramApiException e) { log.error("Error sending message", e); }
    }
}