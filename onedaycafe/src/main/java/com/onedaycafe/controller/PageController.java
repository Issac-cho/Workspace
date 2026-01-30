package com.onedaycafe.controller;

import com.google.gson.Gson;
import com.onedaycafe.dao.OrderDAO;
import com.onedaycafe.dto.TrscDTO; // 주문 정보를 담을 DTO (구조 필요)
import com.onedaycafe.dao.MenuDAO;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@WebServlet({"/order", "/central", "/admin", "/kitchen/*"})
public class PageController extends HttpServlet {

    private MenuDAO menuDAO;

    @Override
    public void init() {
        menuDAO = new MenuDAO();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        String path = req.getServletPath();
        String pathInfo = req.getPathInfo();
        String view = "";

        switch (path) {
            case "/order":
                view = "/WEB-INF/views/order.jsp";
                req.setAttribute("menuList", menuDAO.getAllMenus());
                break;
            case "/central":
                view = "/WEB-INF/views/central.jsp";
                break;
            case "/admin":
                view = "/WEB-INF/views/admin.jsp";
                req.setAttribute("menuList", menuDAO.getAllMenus());
                break;
            case "/kitchen":
                view = "/WEB-INF/views/kitchen.jsp";
                String groupId = "1";
                if (pathInfo != null && pathInfo.length() > 1) {
                    groupId = pathInfo.substring(1);
                }
                req.setAttribute("groupId", groupId);
                break;
        }

        if (!view.isEmpty()) {
            req.getRequestDispatcher(view).forward(req, res);
        }
    }
}