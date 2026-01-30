package com.onedaycafe.config;

import java.sql.*;

public class DBConnection {
    public static Connection getConnection() throws Exception {
        Class.forName("org.mariadb.jdbc.Driver");
        String url = "jdbc:mariadb://10.0.2.30:3306/cafeDB";
        String id = "dbuser";
        String pw = "dbuser";
        return DriverManager.getConnection(url, id, pw);
    }
}