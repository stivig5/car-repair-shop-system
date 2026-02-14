package com.diploma.carservice.service.telegram;

import com.diploma.carservice.entity.Order;
import com.diploma.carservice.entity.User;
import com.diploma.carservice.entity.enums.OrderStatus;
import com.diploma.carservice.entity.enums.UserRole;
import com.diploma.carservice.repository.OrderRepository;
import com.diploma.carservice.repository.UserRepository;
import com.diploma.carservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.bots.AbsSender;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class BotOrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;

    public BotOrderService(OrderRepository orderRepository,
                           UserRepository userRepository,
                           @Lazy OrderService orderService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.orderService = orderService;
    }

    private String translateStatus(OrderStatus status) {
        if (status == null) return "Nieznany";
        return switch (status) {
            case NEW -> "🆕 Nowe";
            case IN_PROGRESS -> "⚙️ W trakcie";
            case WAITING_PARTS -> "📦 Czeka na części";
            case COMPLETED -> "✅ Zakończone";
            default -> status.name();
        };
    }

    public void handleOrderList(Long chatId, AbsSender sender) {
        User user = findUser(chatId);
        if (user == null) {
            sendText(sender, chatId, "🚫 Brak powiązania z kontem. Twój ID: " + chatId);
            return;
        }

        List<Order> orders;
        if (user.getUserRole() == UserRole.MECHANIC) {
            orders = orderRepository.findAll().stream()
                    .filter(o -> o.getMechanic() != null && o.getMechanic().getId().equals(user.getId()))
                    .filter(o -> o.getStatus() != OrderStatus.COMPLETED)
                    .toList();
        } else {
            orders = orderRepository.findAll().stream()
                    .filter(o -> o.getCar() != null && o.getCar().getOwner().getId().equals(user.getId()))
                    .toList();
        }

        if (orders.isEmpty()) {
            sendText(sender, chatId, "Brak aktywnych zleceń.");
            return;
        }

        sendText(sender, chatId, "📋 Twoje aktywne zlecenia:");
        for (Order order : orders) {
            String label = String.format("#%d | %s | %s",
                    order.getId(),
                    order.getCar().getModel(),
                    translateStatus(order.getStatus()));

            sendInlineButton(sender, chatId, label, "🔍 Szczegóły", "DETAILS_" + order.getId());
        }
    }

    public void handleCallback(Long chatId, String data, AbsSender sender) {
        String[] parts = data.split("_", 3);
        String action = parts[0];
        Long orderId = Long.parseLong(parts[1]);

        if ("DETAILS".equals(action)) {
            showDetails(chatId, orderId, sender);
        } else if ("STATUS".equals(action)) {
            showStatusMenu(chatId, orderId, sender);
        } else if ("SETSTATUS".equals(action)) {
            updateStatus(chatId, orderId, OrderStatus.valueOf(parts[2]), sender);
        }
    }

    private void showDetails(Long chatId, Long orderId, AbsSender sender) {
        Optional<Order> opt = orderRepository.findById(orderId);
        if (opt.isEmpty()) return;
        Order order = opt.get();
        User user = findUser(chatId);

        String desc = String.format("""
                🔧 <b>Szczegóły zlecenia #%d</b>
                
                Pojazd: %s %s
                Opis: %s
                Status: %s
                """,
                order.getId(),
                order.getCar().getBrand(), order.getCar().getModel(),
                order.getDescription(),
                translateStatus(order.getStatus())
        );

        InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> rows = new ArrayList<>();

        if (user.getUserRole() == UserRole.MECHANIC) {
            rows.add(createBtn("🔄 Zmień Status", "STATUS_" + order.getId()));
            rows.add(createBtn("💬 Czat z Klientem", "CHAT_" + order.getId()));
        } else {
            rows.add(createBtn("💬 Czat z Mechanikiem", "CHAT_" + order.getId()));
        }

        markup.setKeyboard(rows);
        sendMarkup(sender, chatId, desc, markup);
    }

    private void showStatusMenu(Long chatId, Long orderId, AbsSender sender) {
        InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> rows = new ArrayList<>();

        rows.add(createBtn("W toku", "SETSTATUS_" + orderId + "_IN_PROGRESS"));
        rows.add(createBtn("Czeka na części", "SETSTATUS_" + orderId + "_WAITING_PARTS"));
        rows.add(createBtn("Zakończone", "SETSTATUS_" + orderId + "_COMPLETED"));

        markup.setKeyboard(rows);
        sendMarkup(sender, chatId, "Wybierz nowy status:", markup);
    }

    private void updateStatus(Long chatId, Long orderId, OrderStatus newStatus, AbsSender sender) {
        try {
            orderService.updateStatus(orderId, newStatus);

            sendText(sender, chatId, "✅ Status zmieniony na: " + newStatus);
            showDetails(chatId, orderId, sender);
        } catch (Exception e) {
            log.error("Błąd aktualizacji statusu przez bota", e);
            sendText(sender, chatId, "❌ Błąd aktualizacji statusu: " + e.getMessage());
        }
    }

    private User findUser(Long chatId) {
        return userRepository.findAll().stream()
                .filter(u -> chatId.equals(u.getTelegramChatId()))
                .findFirst().orElse(null);
    }

    private void sendText(AbsSender sender, Long chatId, String text) {
        try { sender.execute(new SendMessage(chatId.toString(), text)); } catch (Exception e) {}
    }

    private void sendInlineButton(AbsSender sender, Long chatId, String text, String btnLabel, String callback) {
        InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> rows = new ArrayList<>();
        rows.add(createBtn(btnLabel, callback));
        markup.setKeyboard(rows);
        sendMarkup(sender, chatId, text, markup);
    }

    private void sendMarkup(AbsSender sender, Long chatId, String text, InlineKeyboardMarkup markup) {
        SendMessage msg = new SendMessage(chatId.toString(), text);
        msg.setParseMode("HTML");
        msg.setReplyMarkup(markup);
        try { sender.execute(msg); } catch (Exception e) {}
    }

    private List<InlineKeyboardButton> createBtn(String label, String callback) {
        var btn = new InlineKeyboardButton();
        btn.setText(label);
        btn.setCallbackData(callback);
        return List.of(btn);
    }
}