package com.diploma.carservice.service.telegram;

import com.diploma.carservice.entity.Appointment;
import com.diploma.carservice.entity.Car;
import com.diploma.carservice.entity.User;
import com.diploma.carservice.entity.enums.AppointmentStatus;
import com.diploma.carservice.repository.AppointmentRepository;
import com.diploma.carservice.repository.CarRepository;
import com.diploma.carservice.repository.UserRepository;
import com.diploma.carservice.service.telegram.model.ChatSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.bots.AbsSender;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class BotAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final BotChatService chatService;

    private final Map<Long, String> tempDates = new ConcurrentHashMap<>();

    @Transactional
    public void showMyAppointments(Long chatId, AbsSender sender) {
        try {
            User user = findUser(chatId);
            if (user == null) {
                sendText(sender, chatId, "🚫 Nie znaleziono użytkownika w bazie. Upewnij się, że jesteś zalogowany.");
                return;
            }

            List<Appointment> apps = appointmentRepository.findByCarOwnerId(user.getId());

            SendMessage msg = new SendMessage();
            msg.setChatId(chatId.toString());
            msg.setParseMode("HTML");

            if (apps.isEmpty()) {
                msg.setText("📅 <b>Moje Wizyty</b>\n\nNie masz jeszcze zaplanowanych wizyt.");
                InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
                List<List<InlineKeyboardButton>> rows = new ArrayList<>();
                rows.add(createBtn("➕ Umów nową wizytę", "APP_CREATE_START"));
                markup.setKeyboard(rows);
                msg.setReplyMarkup(markup);
            } else {
                StringBuilder sb = new StringBuilder("<b>📅 Twoje wizyty:</b>\n\n");
                InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
                List<List<InlineKeyboardButton>> rows = new ArrayList<>();

                for (Appointment app : apps) {
                    if(app.getStatus() == AppointmentStatus.REJECTED) continue;

                    String carInfo = (app.getCar() != null) ? app.getCar().getBrand() + " " + app.getCar().getModel() : "Nieznany pojazd";
                    String dateInfo = (app.getRequestedDate() != null) ? app.getRequestedDate().toString().replace("T", " ") : "Brak daty";

                    sb.append(String.format("🔹 <b>%s</b> | %s\nAuto: %s\nStatus: %s\n\n",
                            dateInfo,
                            app.getDescription(),
                            carInfo,
                            translateStatus(app.getStatus())
                    ));

                    if (app.getStatus() == AppointmentStatus.REQUESTED || app.getStatus() == AppointmentStatus.CONFIRMED) {
                        rows.add(createBtn("❌ Odwołaj: " + app.getRequestedDate().toLocalDate(), "APP_CANCEL_" + app.getId()));
                    }
                }
                rows.add(createBtn("➕ Umów nową wizytę", "APP_CREATE_START"));
                markup.setKeyboard(rows);
                msg.setText(sb.toString());
                msg.setReplyMarkup(markup);
            }

            sender.execute(msg);
        } catch (Exception e) {
            log.error("Błąd podczas wyświetlania wizyt", e);
            sendText(sender, chatId, "❌ Wystąpił błąd: " + e.getMessage());
        }
    }

    public void handleCallback(Long chatId, String data, AbsSender sender) {
        try {
            if (data.equals("APP_CREATE_START")) {
                startCreation(chatId, sender);
            } else if (data.startsWith("APP_CANCEL_")) {
                cancelAppointment(chatId, Long.parseLong(data.split("_")[2]), sender);
            } else if (data.startsWith("APP_CAR_")) {
                Long carId = Long.parseLong(data.split("_")[2]);
                askForDate(chatId, carId, sender);
            }
        } catch (Exception e) {
            log.error("Błąd w obsłudze przycisku wizyt", e);
            sendText(sender, chatId, "❌ Błąd obsługi przycisku: " + e.getMessage());
        }
    }

    private void startCreation(Long chatId, AbsSender sender) {
        try {
            User user = findUser(chatId);
            if (user == null) {
                sendText(sender, chatId, "🚫 Błąd: Nie zidentyfikowano użytkownika.");
                return;
            }

            List<Car> cars = carRepository.findByOwnerId(user.getId());

            if (cars.isEmpty()) {
                sendText(sender, chatId, "🚫 Nie masz przypisanych żadnych pojazdów. Skontaktuj się z warsztatem.");
                return;
            }

            InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
            List<List<InlineKeyboardButton>> rows = new ArrayList<>();
            for (Car car : cars) {
                String label = String.format("🚗 %s %s (%s)", car.getBrand(), car.getModel(), car.getLicPlate());
                rows.add(createBtn(label, "APP_CAR_" + car.getId()));
            }

            markup.setKeyboard(rows);

            SendMessage msg = new SendMessage(chatId.toString(), "<b>Wybierz pojazd, którego dotyczy wizyta:</b>");
            msg.setParseMode("HTML");
            msg.setReplyMarkup(markup);
            sender.execute(msg);

        } catch (Exception e) {
            log.error("Błąd w startCreation", e);
            sendText(sender, chatId, "❌ Nie udało się pobrać listy pojazdów: " + e.getMessage());
        }
    }

    private void askForDate(Long chatId, Long carId, AbsSender sender) {
        chatService.startChat(chatId, ChatSession.ChatType.APP_WAITING_DATE, carId, sender);
        sendText(sender, chatId, "📅 Podaj proponowaną datę i godzinę w formacie:\n<b>RRRR-MM-DD GG:MM</b>\n(np. 2024-05-20 14:30)");
    }

    public void processDateInput(Long chatId, String text, Long carId, AbsSender sender) {
        try {
            String normalized = text.replace(" ", "T");
            if(normalized.length() == 10) normalized += "T09:00";

            LocalDateTime.parse(normalized);
            tempDates.put(chatId, normalized);

            chatService.startChat(chatId, ChatSession.ChatType.APP_WAITING_DESC, carId, sender);
            sendText(sender, chatId, "📝 Podaj krótki opis usterki / przyczyny wizyty:");

        } catch (DateTimeParseException e) {
            sendText(sender, chatId, "⚠️ Błędny format daty. Spróbuj ponownie:\nRRRR-MM-DD GG:MM");
        }
    }

    @Transactional
    public void processDescriptionInput(Long chatId, String text, Long carId, AbsSender sender) {
        String dateStr = tempDates.get(chatId);
        if (dateStr == null) {
            sendText(sender, chatId, "⚠️ Błąd sesji. Rozpocznij od nowa.");
            chatService.endChat(chatId, sender);
            return;
        }

        try {
            Car car = carRepository.findById(carId).orElseThrow(() -> new RuntimeException("Car not found"));

            Appointment app = new Appointment();
            app.setCar(car);
            app.setRequestedDate(LocalDateTime.parse(dateStr));
            app.setDescription(text);
            app.setStatus(AppointmentStatus.REQUESTED);

            appointmentRepository.save(app);

            sendText(sender, chatId, "✅ <b>Wizyta została zgłoszona!</b>\nOczekuj na potwierdzenie przez mechanika.");
            chatService.endChat(chatId, sender);
            tempDates.remove(chatId);

            showMyAppointments(chatId, sender);

        } catch (Exception e) {
            log.error("Error saving app", e);
            sendText(sender, chatId, "❌ Błąd zapisu wizyty: " + e.getMessage());
        }
    }

    private void cancelAppointment(Long chatId, Long appId, AbsSender sender) {
        appointmentRepository.findById(appId).ifPresent(app -> {
            app.setStatus(AppointmentStatus.REJECTED);
            appointmentRepository.save(app);
            sendText(sender, chatId, "🗑️ Wizyta została odwołana.");
            showMyAppointments(chatId, sender);
        });
    }

    private User findUser(Long chatId) {
        return userRepository.findByTelegramChatId(chatId).orElse(null);
    }

    private String translateStatus(AppointmentStatus status) {
        if (status == null) return "?";
        return switch (status) {
            case REQUESTED -> "⏳ Oczekuje";
            case CONFIRMED -> "👍 Potwierdzona";
            case REJECTED -> "❌ Anulowana";
            case COMPLETED -> "✅ Zakończona";
        };
    }

    private void sendText(AbsSender sender, Long chatId, String text) {
        SendMessage msg = new SendMessage(chatId.toString(), text);
        msg.setParseMode("HTML");
        try { sender.execute(msg); } catch (Exception e) {}
    }

    private List<InlineKeyboardButton> createBtn(String label, String callback) {
        var btn = new InlineKeyboardButton();
        btn.setText(label);
        btn.setCallbackData(callback);
        return List.of(btn);
    }
}