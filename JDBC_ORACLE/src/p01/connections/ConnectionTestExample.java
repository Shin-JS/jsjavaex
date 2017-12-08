package p01.connections;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**DB접속하기
 * 1. driver로딩
 * 2. connection 얻기
 * 3. 쿼리객체 생성
 * 4. 작업
 * 5. connection 종료 
 **/
public class ConnectionTestExample {
	public static void main(String[] args) {
		//Connection 객체
		Connection conn = null;
		String url = "jdbc:oracle:thin:@localhost:1521:xe";
		String user = "hr";
		String password = "hr";
		try {
			Class.forName("oracle.jdbc.driver.OracleDriver");
			conn = DriverManager.getConnection(url, user, password);
			if(conn!=null) {
				System.out.println("연결완료");
			}
			conn.close();
		} catch (ClassNotFoundException e) {
			System.out.println(e.getMessage());
		} catch (SQLException e1) {
			System.out.println(e1.getMessage());
		}
	}
}
