package com.onedaycafe.dto;

public class OrderDTO {
    private int order_id;
    private int trsc_id;
    private int menu_id;
    private int quantity;
    private int status; // 0 = none , 1 = be cooked , 2 = be served(complete)

    public OrderDTO() {}

    public OrderDTO(int order_id, int trsc_id, int menu_id, int quantity, int status) {
        this.order_id = order_id;
        this.trsc_id = trsc_id;
        this.menu_id = menu_id;
        this.quantity = quantity;
        this.status = status;
    }

    public int getOrder_id() { return order_id; }
    public void setOrder_id(int order_id) { this.order_id = order_id; }

    public int getTrsc_id() { return trsc_id; }
    public void setTrsc_id(int trsc_id) { this.trsc_id = trsc_id; }

    public int getMenu_id() { return menu_id; }
    public void setMenu_id(int menu_id) { this.menu_id = menu_id; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
}