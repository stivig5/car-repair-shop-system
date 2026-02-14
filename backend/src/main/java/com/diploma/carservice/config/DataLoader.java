package com.diploma.carservice.config;

import com.diploma.carservice.entity.*;
import com.diploma.carservice.entity.enums.AppointmentStatus;
import com.diploma.carservice.entity.enums.CarStatus;
import com.diploma.carservice.entity.enums.OrderStatus;
import com.diploma.carservice.entity.enums.UserRole;
import com.diploma.carservice.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@ConditionalOnProperty(name = "app.dataloader.enabled", havingValue = "true", matchIfMissing = true)
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final AppointmentRepository appointmentRepository;
    private final InventoryPartRepository inventoryPartRepository;
    private final OrderRepository orderRepository;
    private final OrderTaskRepository orderTaskRepository;
    private final OrderPartRepository orderPartRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UserRepository userRepository,
                      CarRepository carRepository,
                      AppointmentRepository appointmentRepository,
                      InventoryPartRepository inventoryPartRepository,
                      OrderRepository orderRepository,
                      OrderTaskRepository orderTaskRepository,
                      OrderPartRepository orderPartRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.carRepository = carRepository;
        this.appointmentRepository = appointmentRepository;
        this.inventoryPartRepository = inventoryPartRepository;
        this.orderRepository = orderRepository;
        this.orderTaskRepository = orderTaskRepository;
        this.orderPartRepository = orderPartRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Prevent data duplication on restart
        if (userRepository.count() > 0) {
            System.out.println(">>> Database is not empty. Skipping sample data loading.");
            return;
        }

        System.out.println(">>> Starting extended data loading...");

        // ==========================================
        // 1. USERS
        // ==========================================

        // Admin
        User admin = createUser("admin", "password", "Main Administrator", UserRole.ADMIN, "111-222-333");

        // Mechanics
        User mechanic1 = createUser("mechanic", "password", "Jan Kowalski", UserRole.MECHANIC, "555-666-777");
        User mechanic2 = createUser("mechanic2", "password", "Piotr Naprawski", UserRole.MECHANIC, "555-999-000");
        User mechanic3 = createUser("mechanic3", "password", "Michalych", UserRole.MECHANIC, "+48574063026");

        // Clients
        User client1 = createUser("klient", "password", "Stanislav Ivantsov", UserRole.CLIENT, "+380982356416");
        User client2 = createUser("anna", "password", "Anna Wiśniewska", UserRole.CLIENT, "600-100-200");
        User client3 = createUser("marek", "password", "Marek Zegarek", UserRole.CLIENT, "700-800-900");

        // ==========================================
        // 2. INVENTORY PARTS
        // ==========================================

        InventoryPart oilFilter = createPart("Filtr Oleju Bosch", "OF-2023-BSC", 50, "45.00", 10);
        InventoryPart brakePads = createPart("Klocki Hamulcowe Przód", "BP-TRW-99", 20, "120.50", 5);
        InventoryPart syntheticOil = createPart("Olej Syntetyczny 5W30 1L", "OIL-5W30-X", 100, "35.00", 20);

        // New parts
        InventoryPart tire = createPart("Opona Zimowa Dębica 16\"", "OP-ZIM-16", 12, "250.00", 16);
        InventoryPart battery = createPart("Akumulator Varta 74Ah", "AKU-VAR-74", 5, "450.00", 3);
        InventoryPart sparkPlug = createPart("Świeca Zapłonowa NGK", "SP-NGK-IR", 40, "25.00", 20);
        InventoryPart coolant = createPart("Płyn Chłodniczy Borygo 5L", "CHL-BOR-5", 30, "60.00", 10);
        InventoryPart wiper = createPart("Wycieraczka Bosch Aero", "WIP-300", 15, "80.00", 5);
        InventoryPart timingBelt = createPart("Zestaw Rozrządu INA", "TIM-INA-01", 8, "450.00", 2);
        InventoryPart clutchKit = createPart("Zestaw Sprzęgła LuK", "CLU-LUK-99", 4, "900.00", 2);

        // ==========================================
        // 3. CARS
        // ==========================================

        // Client 1 cars (Adam)
        Car car1 = createCar("Toyota", "Yaris", 2018, "WA 12345", client1, CarStatus.AVAILABLE);
        Car car2 = createCar("Audi", "A4 B8", 2015, "WD 2716V", client1, CarStatus.IN_SERVICE);

        // Client 2 cars (Anna)
        Car car3 = createCar("Audi", "A4 B8", 2012, "KR 98765", client2, CarStatus.WAITING);
        Car car4 = createCar("Honda", "Civic VIII", 2009, "PO 45678", client2, CarStatus.AVAILABLE);

        // Client 3 cars (Marek)
        Car car5 = createCar("Ford", "Focus MK3", 2015, "GD 11223", client3, CarStatus.AVAILABLE);

        // ==========================================
        // 4. APPOINTMENTS
        // ==========================================

        createAppointment(client1, car2, LocalDateTime.now().plusDays(2), AppointmentStatus.REQUESTED, "Coś stuka w prawym kole");
        createAppointment(client2, car3, LocalDateTime.now().plusDays(5), AppointmentStatus.CONFIRMED, "Coroczny przegląd i wymiana filtrów");
        createAppointment(client1, car1, LocalDateTime.now().plusWeeks(2), AppointmentStatus.REQUESTED, "Wymiana opon na zimowe");

        // ==========================================
        // 5. CURRENT ORDERS (Active)
        // ==========================================

        // --- ORDER 1 ---
        Order order1 = createOrder(car2, mechanic1, OrderStatus.IN_PROGRESS, "Wymiana oleju i diagnostyka stuków");

        createOrderTask(order1, "Wymiana oleju silnikowego", "100.00", "DONE");
        createOrderTask(order1, "Diagnostyka zawieszenia", "50.00", "IN_PROGRESS");

        createOrderPart(order1, oilFilter, 1);
        createOrderPart(order1, syntheticOil, 4);

        // --- ORDER 3 ---
        Order order3 = createOrder(car3, mechanic1, OrderStatus.WAITING_PARTS, "Wymiana akumulatora i świec");

        createOrderTask(order3, "Wymiana akumulatora", "50.00", "IN_PROGRESS");
        createOrderTask(order3, "Wymiana świec zapłonowych", "120.00", "TODO");

        createOrderPart(order3, battery, 1);
        createOrderPart(order3, sparkPlug, 4);

        // --- ORDER 4 ---
        Order order4 = new Order();
        order4.setCar(car4);
        order4.setStatus(OrderStatus.NEW);
        order4.setDescription("Silnik nierówno pracuje na zimnym");
        order4.setCreateDate(LocalDateTime.now().minusHours(2));
        orderRepository.save(order4);

        // ==========================================
        // 6. HISTORICAL ORDERS (For Reports/Charts)
        // ==========================================

        // --- 5 MONTHS AGO (e.g. August) ---
        Order hOrder1 = createOrder(car5, mechanic2, OrderStatus.COMPLETED, "Wymiana rozrządu i pompy wody");
        hOrder1.setCreateDate(LocalDateTime.now().minusMonths(5));
        hOrder1.setEndDate(LocalDateTime.now().minusMonths(5).plusDays(2));
        orderRepository.save(hOrder1);

        createOrderTask(hOrder1, "Wymiana kompletnego rozrządu", "600.00", "DONE");
        createOrderTask(hOrder1, "Wymiana płynu chłodniczego", "100.00", "DONE");
        createOrderPart(hOrder1, timingBelt, 1);
        createOrderPart(hOrder1, coolant, 1);

        // --- 4 MONTHS AGO (e.g. September) ---
        Order hOrder2 = createOrder(car1, mechanic1, OrderStatus.COMPLETED, "Duży przegląd + hamulce");
        hOrder2.setCreateDate(LocalDateTime.now().minusMonths(4));
        hOrder2.setEndDate(LocalDateTime.now().minusMonths(4).plusDays(1));
        orderRepository.save(hOrder2);

        createOrderTask(hOrder2, "Wymiana tarcz i klocków", "250.00", "DONE");
        createOrderTask(hOrder2, "Serwis olejowy", "100.00", "DONE");
        createOrderPart(hOrder2, brakePads, 1);
        createOrderPart(hOrder2, oilFilter, 1);
        createOrderPart(hOrder2, syntheticOil, 4);

        // --- 3 MONTHS AGO (e.g. October) ---
        // Order A
        Order hOrder3a = createOrder(car4, mechanic2, OrderStatus.COMPLETED, "Wymiana sprzęgła");
        hOrder3a.setCreateDate(LocalDateTime.now().minusMonths(3));
        hOrder3a.setEndDate(LocalDateTime.now().minusMonths(3).plusDays(3));
        orderRepository.save(hOrder3a);

        createOrderTask(hOrder3a, "Demontaż skrzyni biegów", "800.00", "DONE");
        createOrderTask(hOrder3a, "Wymiana sprzęgła", "400.00", "DONE");
        createOrderPart(hOrder3a, clutchKit, 1);

        // Order B
        Order hOrder3b = createOrder(car2, mechanic1, OrderStatus.COMPLETED, "Wymiana wycieraczek i płynów");
        hOrder3b.setCreateDate(LocalDateTime.now().minusMonths(3).plusDays(10));
        hOrder3b.setEndDate(LocalDateTime.now().minusMonths(3).plusDays(10).plusHours(2));
        orderRepository.save(hOrder3b);

        createOrderTask(hOrder3b, "Przegląd ogólny", "50.00", "DONE");
        createOrderPart(hOrder3b, wiper, 2);
        createOrderPart(hOrder3b, coolant, 1);

        // --- 2 MONTHS AGO ---
        Order hOrder4 = createOrder(car3, mechanic1, OrderStatus.COMPLETED, "Wymiana opon na zimowe");
        hOrder4.setCreateDate(LocalDateTime.now().minusMonths(2));
        hOrder4.setEndDate(LocalDateTime.now().minusMonths(2).plusHours(1));
        orderRepository.save(hOrder4);

        createOrderTask(hOrder4, "Wymiana opon z wyważeniem", "120.00", "DONE");
        createOrderPart(hOrder4, tire, 4); // Client bought 4 tires

        // Order A - Simple repair
        Order hOrder5a = createOrder(car5, mechanic2, OrderStatus.COMPLETED, "Diagnostyka silnika");
        hOrder5a.setCreateDate(LocalDateTime.now().minusMonths(1));
        hOrder5a.setEndDate(LocalDateTime.now().minusMonths(1).plusHours(2));
        orderRepository.save(hOrder5a);
        createOrderTask(hOrder5a, "Podłączenie komputera", "100.00", "DONE");

        // Order B - Battery issue
        Order hOrder5b = createOrder(car1, mechanic1, OrderStatus.COMPLETED, "Awaria akumulatora");
        hOrder5b.setCreateDate(LocalDateTime.now().minusMonths(1).plusDays(15));
        hOrder5b.setEndDate(LocalDateTime.now().minusMonths(1).plusDays(15).plusHours(1));
        orderRepository.save(hOrder5b);
        createOrderTask(hOrder5b, "Wymiana akumulatora", "50.00", "DONE");
        createOrderPart(hOrder5b, battery, 1);

        System.out.println(">>> Data loading finished.");
    }

    // ==========================================
    // HELPER METHODS (DRY)
    // ==========================================

    private User createUser(String username, String pass, String fullName, UserRole role, String phone) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(pass));
        user.setFullName(fullName);
        user.setUserRole(role);
        user.setPhoneNumber(phone);
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    private InventoryPart createPart(String name, String serial, int stock, String price, int minQty) {
        InventoryPart part = new InventoryPart();
        part.setName(name);
        part.setSerialNumber(serial);
        part.setQuantityInStock(stock);
        part.setMinQuantity(minQty);
        part.setPrice(new BigDecimal(price));
        return inventoryPartRepository.save(part);
    }

    private Car createCar(String brand, String model, int year, String plate, User owner, CarStatus status) {
        Car car = new Car();
        car.setBrand(brand);
        car.setModel(model);
        car.setYear(year);
        car.setLicPlate(plate);
        car.setOwner(owner);
        car.setStatus(status);
        return carRepository.save(car);
    }

    private Appointment createAppointment(User client, Car car, LocalDateTime date, AppointmentStatus status, String desc) {
        Appointment app = new Appointment();
        app.setClient(client);
        app.setCar(car);
        app.setRequestedDate(date);
        app.setStatus(status);
        app.setDescription(desc);
        return appointmentRepository.save(app);
    }

    private Order createOrder(Car car, User mechanic, OrderStatus status, String desc) {
        Order order = new Order();
        order.setCar(car);
        order.setMechanic(mechanic);
        order.setStatus(status);
        order.setDescription(desc);
        order.setCreateDate(LocalDateTime.now());
        order.setTotalPrice(BigDecimal.ZERO);
        return orderRepository.save(order);
    }

    private OrderTask createOrderTask(Order order, String name, String price, String status) {
        OrderTask task = new OrderTask();
        task.setOrder(order);
        task.setTaskName(name);
        task.setPrice(new BigDecimal(price));
        task.setStatus(status);

        BigDecimal currentTotal = order.getTotalPrice() != null ? order.getTotalPrice() : BigDecimal.ZERO;
        order.setTotalPrice(currentTotal.add(new BigDecimal(price)));
        orderRepository.save(order);

        return orderTaskRepository.save(task);
    }

    private OrderPart createOrderPart(Order order, InventoryPart part, int qty) {
        OrderPart op = new OrderPart();
        op.setOrder(order);
        op.setPart(part);
        op.setQuantity(qty);

        BigDecimal partTotal = part.getPrice().multiply(BigDecimal.valueOf(qty));
        BigDecimal currentTotal = order.getTotalPrice() != null ? order.getTotalPrice() : BigDecimal.ZERO;
        order.setTotalPrice(currentTotal.add(partTotal));
        orderRepository.save(order);

        return orderPartRepository.save(op);
    }
}