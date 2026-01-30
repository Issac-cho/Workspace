package com.onedaycafe.controller;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;
import com.onedaycafe.dao.OrderDAO;
import com.onedaycafe.dto.OrderDTO;
import com.onedaycafe.dto.TrscDTO;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet; // web.xml 사용 시 생략 가능
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class OrderApiController extends HttpServlet {

    private OrderDAO orderDAO = new OrderDAO();
    private Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        // 1. 요청/응답 인코딩 설정
        req.setCharacterEncoding("UTF-8");
        res.setContentType("application/json; charset=UTF-8");

        PrintWriter out = res.getWriter();
        Map<String, Object> responseMap = new HashMap<>();

        try {
            // 2. JSON 문자열 읽기
            BufferedReader reader = req.getReader();
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            String jsonString = sb.toString();

            // 3. JSON 파싱 (핵심 로직)
            // 전체 문자열을 'JsonObject'로 먼저 변환
            JsonObject jsonObject = JsonParser.parseString(jsonString).getAsJsonObject();

            // A. TrscDTO 파싱 (table_no, payment, order_time)
            // Gson은 "order" 배열이 TrscDTO에 없어도 무시하고 나머지 필드만 매핑해줍니다.
            TrscDTO trscDTO = gson.fromJson(jsonObject, TrscDTO.class);

            // B. Order 리스트 파싱 (order : [...])
            List<OrderDTO> orderList = null;
            if (jsonObject.has("order")) {
                JsonArray orderArray = jsonObject.getAsJsonArray("order");

                // List<OrderDTO> 타입을 정의하기 위해 TypeToken 사용
                Type orderListType = new TypeToken<List<OrderDTO>>(){}.getType();
                orderList = gson.fromJson(orderArray, orderListType);
            }

            // 4. DAO 호출 (DB 저장)
            // 트랜잭션 정보와 주문 상세 리스트를 함께 넘겨서 처리
            boolean isSuccess = false;
            if (trscDTO != null && orderList != null && !orderList.isEmpty()) {
                isSuccess = orderDAO.createFullOrder(trscDTO, orderList);
            }

            // 5. 응답 생성
            if (isSuccess) {
                responseMap.put("status", "success");
                responseMap.put("message", "주문이 정상적으로 접수되었습니다.");
                res.setStatus(HttpServletResponse.SC_OK);
            } else {
                responseMap.put("status", "fail");
                responseMap.put("message", "주문 저장에 실패했습니다. (데이터 확인 필요)");
                res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }

        } catch (Exception e) {
            e.printStackTrace();
            responseMap.put("status", "error");
            responseMap.put("message", "서버 에러: " + e.getMessage());
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }

        // 6. 결과 전송
        out.print(gson.toJson(responseMap));
        out.flush();
    }
}