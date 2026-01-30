package com.onedaycafe.controller;

import com.google.gson.Gson;
import com.onedaycafe.dao.MenuDAO;
import com.onedaycafe.dao.OrderDAO;
import com.onedaycafe.dto.MenuDTO;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

public class ManagementApiController extends HttpServlet {

    private MenuDAO menuDAO = new MenuDAO();
    private OrderDAO orderDAO = new OrderDAO();
    private Gson gson = new Gson();

    // PATCH 메소드 처리를 위해 service 오버라이드
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        String method = req.getMethod();

        // PATCH 요청인 경우 doPatch 메소드(직접 생성) 호출
        if (method.equalsIgnoreCase("PATCH")) {
            doPatch(req, res);
        } else {
            super.service(req, res); // GET, POST 등은 부모에게 위임
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        res.setContentType("application/json; charset=UTF-8");
        String path = req.getServletPath();

        // 메뉴 추가 (/api/addmenu)
        if ("/api/addmenu".equals(path)) {
            BufferedReader reader = req.getReader();
            MenuDTO newMenu = gson.fromJson(reader, MenuDTO.class);

            boolean result = menuDAO.addMenu(newMenu);
            sendResponse(res, result, "메뉴가 추가되었습니다.");
        }
    }

    // PATCH 요청 처리 로직
    protected void doPatch(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        res.setContentType("application/json; charset=UTF-8");

        String path = req.getServletPath(); // "/api/soldout", "/api/deletemenu", "/api/trsc"
        String pathInfo = req.getPathInfo(); // "/1/cook" 같은 뒷부분

        boolean result = false;

        try {
            // 1. 메뉴 품절 처리
            if ("/api/soldout".equals(path)) {
                Map<String, Double> data = gson.fromJson(req.getReader(), Map.class);
                int menuId = data.get("menu_id").intValue();
                result = menuDAO.updateSoldOut(menuId, 1); // 1: 품절
            }
            // 2. 메뉴 삭제 처리
            else if ("/api/deletemenu".equals(path)) {
                Map<String, Double> data = gson.fromJson(req.getReader(), Map.class);
                int menuId = data.get("menu_id").intValue();
                result = menuDAO.updateRender(menuId, 0); // 0: 렌더링 안함(삭제)
            }
            // 3. 주문 상태 변경 (/api/trsc/{id}/cook 또는 serve)
            else if ("/api/trsc".equals(path) && pathInfo != null) {
                // pathInfo 예시: "/15/cook"
                String[] parts = pathInfo.split("/");

                if (parts.length >= 3) {
                    int orderId = Integer.parseInt(parts[1]); // 15
                    String action = parts[2]; // "cook" or "serve"

                    if ("cook".equals(action)) {
                        result = orderDAO.updateCookStatus(orderId, 1);
                    } else if ("serve".equals(action)) {
                        result = orderDAO.updateServeStatus(orderId, 1);
                    }
                }
            }

            sendResponse(res, result, "상태가 변경되었습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    // JSON 응답 전송용 헬퍼 메소드
    private void sendResponse(HttpServletResponse res, boolean isSuccess, String successMsg) throws IOException {
        Map<String, Object> map = new HashMap<>();
        if (isSuccess) {
            map.put("status", "success");
            map.put("message", successMsg);
            res.setStatus(200);
        } else {
            map.put("status", "fail");
            map.put("message", "요청 처리 실패");
            res.setStatus(500);
        }
        res.getWriter().print(gson.toJson(map));
    }
}