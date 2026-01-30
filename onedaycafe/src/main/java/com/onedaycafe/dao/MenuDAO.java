package com.onedaycafe.dao;

import com.onedaycafe.dto.MenuDTO;
import com.onedaycafe.config.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MenuDAO {

    private int check_menu(String name) {
        String findsql = "SELECT menu_id FROM MENU WHERE name = ?";
        try (Connection conn = DBConnection.getConnection();
            PreparedStatement pstmt = conn.prepareStatement(findsql);) {

            pstmt.setString(1, name);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("menu_id");
                } else {
                    return 0;
                }
            }

        } catch(Exception e){
            e.printStackTrace();
            return 0;
        }
    }
    // 기능: 모든 메뉴 목록을 가져온다
    public List<MenuDTO> getAllMenus() {
        List<MenuDTO> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            // 1. DB 연결 (아까 만든 DBConnection 사용)
            conn = DBConnection.getConnection();

            // 2. SQL 작성
            String sql = "SELECT * FROM MENU WHERE is_render = 1 ORDERBY menu_id";
            pstmt = conn.prepareStatement(sql);

            // 3. 실행 및 결과 받기
            rs = pstmt.executeQuery();

            // 4. 결과를 하나씩 꺼내서 DTO(상자)에 담기
            while (rs.next()) {
                MenuDTO menu = new MenuDTO();
                menu.setMenu_id(rs.getInt("menu_id"));
                menu.setName(rs.getString("name"));
                menu.setPrice(rs.getInt("price"));
                menu.setGroup(rs.getInt("group_num"));
                menu.setCategory(rs.getString("category"));
                menu.setSoldout(rs.getInt("is_soldout"));
                menu.setRender(rs.getInt("is_render"));

                list.add(menu); // 리스트에 추가
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try { if (rs != null) rs.close(); } catch (Exception e) {}
            try { if (pstmt != null) pstmt.close(); } catch (Exception e) {}
            try { if (conn != null) conn.close(); } catch (Exception e) {}
        }

        return list; // DTO들이 담긴 리스트 반환
    }

    public boolean addMenu(MenuDTO newMenu){
        int menuid = check_menu(newMenu.getName());
        if(menuid != 0) {
            try {
                updateRender(menuid, 1);
                return true;
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        }
        else{
            String sql = "INSERT INTO MENU (name, price, coupon_count, group_num, category, is_soldout, is_render) VALUES (?, ?, ?, ?, ?, ?, ?)";

            try (Connection conn = DBConnection.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(sql)) {

                pstmt.setString(1, newMenu.getName());
                pstmt.setInt(2, newMenu.getPrice());
                pstmt.setInt(3, newMenu.getCoupon());
                pstmt.setInt(4, newMenu.getGroup());
                pstmt.setString(5, newMenu.getCategory());
                pstmt.setInt(6, 0); // 판매중
                pstmt.setInt(7, 1); // 화면 표시

                int result = pstmt.executeUpdate();

                return result > 0;

            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        }
    }

    public boolean updateSoldOut(int menuid, int setnum){

        String sql = "UPDATE MENU SET is_soldout = ? WHERE menuid = ?";

        try(Connection conn = DBConnection.getConnection();
            PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, setnum);
            pstmt.setInt(2, menuid);

            int result = pstmt.executeUpdate();

            return result > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean updateRender(int menuid, int setnum){

        String sql = "UPDATE MENU SET is_render = ? WHERE menuid = ?";

        try(Connection conn = DBConnection.getConnection();
            PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, setnum);
            pstmt.setInt(2, menuid);

            int result = pstmt.executeUpdate();

            return result > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}