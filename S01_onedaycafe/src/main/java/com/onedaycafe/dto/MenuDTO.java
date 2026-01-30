package com.onedaycafe.dto;

public class MenuDTO {
    // 1. DB 테이블 컬럼과 일치하는 변수 선언
    private int menu_id;
    private String name;
    private int price;
    private int coupon_count;
    private int group_num;
    private String category;
    private int is_soldout;
    private int is_render;

    // 2. 기본 생성자 & 파라미터 있는 생성자
    public MenuDTO() {}

    public MenuDTO(int menu_id, String name, int price, int coupon_count, int group_num, String category, int is_soldout, int is_render) {
        this.menu_id = menu_id;
        this.name = name;
        this.price = price;
        this.coupon_count = coupon_count;
        this.group_num = group_num;
        this.category = category;
        this.is_soldout = is_soldout;
        this. is_render = is_render;
    }

    // 3. Getter & Setter (데이터를 넣고 빼기 위해 필수)
    public int getMenu_id() { return menu_id; }
    public void setMenu_id(int menu_id) { this.menu_id = menu_id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getPrice() { return price; }
    public void setPrice(int price) { this.price = price; }

    public int getCoupon() { return coupon_count; }
    public void setCoupon(int coupon_count) { this.coupon_count = coupon_count; }

    public int getGroup() { return group_num; }
    public void setGroup(int group_num) { this.group_num = group_num; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getSoldout() { return is_soldout; }
    public void setSoldout(int is_soldout) { this.is_soldout = is_soldout; }

    public int getRender() { return is_render; }
    public void setRender(int is_render) { this.is_render = is_render; }
}