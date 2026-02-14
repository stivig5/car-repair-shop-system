package com.diploma.carservice.service.telegram.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatSession {
    private ChatType type;
    private Long entityId;

    public enum ChatType {
        ORDER,
        APPOINTMENT,
        APP_WAITING_DATE,
        APP_WAITING_DESC
    }
}