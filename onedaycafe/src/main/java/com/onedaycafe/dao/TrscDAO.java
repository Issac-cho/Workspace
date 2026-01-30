package com.onedaycafe.dao;

import com.onedaycafe.dto.TrscDTO;
import com.onedaycafe.config.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class TrscDAO {

    // 기능: 모든 메뉴 목록을 가져온다
    public List<TrscDTO> getAllTrscs() {
        List<TrscDTO> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            // 1. DB 연결 (아까 만든 DBConnection 사용)
            conn = DBConnection.getConnection();

            // 2. SQL 작성
            String sql = "SELECT * FROM menu WHERE is_render = 1 ORDERBY menu_id";
            pstmt = conn.prepareStatement(sql);

            // 3. 실행 및 결과 받기
            rs = pstmt.executeQuery();

            // 4. 결과를 하나씩 꺼내서 DTO(상자)에 담기
            while (rs.next()) {
                TrscDTO trsc = new TrscDTO();
                trsc.setTrsc_id(rs.getInt("trsc_id"));
                trsc.setTable_no(rs.getInt("table_no"));
                trsc.setPayment(rs.getString("payment"));
                trsc.setOrder_time(rs.getString("order_time"));

                list.add(trsc); // 리스트에 추가
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
}