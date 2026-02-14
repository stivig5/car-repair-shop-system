package com.diploma.carservice.service.telegram;

import com.diploma.carservice.entity.User;
import com.diploma.carservice.entity.enums.UserRole;
import com.diploma.carservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Contact;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.bots.AbsSender;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BotMenuService {

    private final UserRepository userRepository;

    public void showMainMenu(Long chatId, AbsSender sender) {
        User user = findUser(chatId);
        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        List<KeyboardRow> keyboard = new ArrayList<>();
        KeyboardRow row1 = new KeyboardRow();
        String text;

        if (user != null) {
            if (user.getUserRole() == UserRole.MECHANIC) {
                row1.add("🔧 Moje Zlecenia");
                text = "Witaj " + user.getFullName() + "! (Mechanik)\nWybierz opcję:";
            } else {
                row1.add("🚗 Moje Naprawy");
                row1.add("📅 Moje Wizyty");
                text = "Witaj " + user.getFullName() + "! (Klient)\nWybierz opcję:";
            }
        } else {
            KeyboardButton contactBtn = new KeyboardButton("📱 Udostępnij numer telefonu");
            contactBtn.setRequestContact(true);
            row1.add(contactBtn);
            text = "Witaj w serwisie! Zaloguj się, udostępniając numer telefonu, aby kontynuować.";
        }

        if (!row1.isEmpty()) {
            keyboard.add(row1);
        }

        keyboardMarkup.setKeyboard(keyboard);
        keyboardMarkup.setResizeKeyboard(true);
        keyboardMarkup.setOneTimeKeyboard(false);

        sendText(sender, chatId, text, keyboardMarkup);
    }

    public void handleContact(Long chatId, Contact contact, AbsSender sender) {
        String incomingNumber = contact.getPhoneNumber();

        Optional<User> userOpt = userRepository.findByPhoneNumber(incomingNumber);

        if (userOpt.isEmpty() && !incomingNumber.startsWith("+")) {
            userOpt = userRepository.findByPhoneNumber("+" + incomingNumber);
        }

        if (userOpt.isEmpty() && incomingNumber.startsWith("+")) {
            userOpt = userRepository.findByPhoneNumber(incomingNumber.substring(1));
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (user.getUserRole() == UserRole.MECHANIC || user.getUserRole() == UserRole.CLIENT) {
                user.setTelegramChatId(chatId);
                userRepository.save(user);
                showMainMenu(chatId, sender);
            } else {
                sendText(sender, chatId, "❌ Numer nie posiada uprawnień do korzystania z bota mobilnego.", null);
            }
        } else {
            sendText(sender, chatId, "❌ Numer nie znaleziony w bazie (" + incomingNumber + "). Skontaktuj się z obsługą.", null);
        }
    }

    private User findUser(Long chatId) {
        return userRepository.findByTelegramChatId(chatId).orElse(null);
    }

    private void sendText(AbsSender sender, Long chatId, String text, ReplyKeyboardMarkup markup) {
        SendMessage msg = new SendMessage(chatId.toString(), text);
        msg.setParseMode("HTML");
        if (markup != null) msg.setReplyMarkup(markup);
        try { sender.execute(msg); } catch (Exception e) { log.error("Error sending menu", e); }
    }
}