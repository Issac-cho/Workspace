package com.onedaycafe.dto;

public class TrscDTO {
    private int trsc_id;
    private int table_no;
    private String payment; // cash or coupon
    private String order_time;

    public TrscDTO() {}

    public TrscDTO(int trsc_id, int table_no, String payment, String order_time) {
        this.trsc_id = trsc_id;
        this.table_no = table_no;
        this.payment = payment;
        this.order_time = order_time;
    }

    public int getTrsc_id() { return trsc_id; }
    public void setTrsc_id(int trsc_id) {
        this.trsc_id = trsc_id;
    }

    public int getTable_no() { return table_no; }
    public void setTable_no(int table_no) {
        this.table_no = table_no;
    }

    public String getPayment() { return payment; }
    public void setPayment(String payment) {
        this.payment = payment;
    }

    public String getOrder_time() { return order_time; }
    public void setOrder_time(String order_time) {
        this.order_time = order_time;
    }
}
