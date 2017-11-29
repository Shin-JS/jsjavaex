package p01.jdbc;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**[JDBC]
 *  쿼리문 사용
 **/
public class JDBCSelect01 {
	public static void main(String[] args) {
		//연결객체 생성
		Connection conn = null;
		String url = "jdbc:mysql://localhost:3306/mydatabase11";
		String user = "user01";
		String password = "user01";
		//쿼리전송객체
		Statement stmt = null;
		//쿼리결과객체
		ResultSet rs = null;
		//쿼리 스트링
		String sql = "select * from goods";
		try {
			//1단계 - 드라이버 로딩
			Class.forName("com.mysql.jdbc.Driver");
			//2단계 - 연결
			conn = DriverManager.getConnection(url, user, password);
			//3단계 - 작업
			stmt = conn.createStatement(); //1)statement객체 생성
			rs = stmt.executeQuery(sql); //2)statement문 실행 및 결과 얻기
			System.out.println("|---------------------------------------|");
			while(rs.next()) { //3)쿼리결과 다음객체에서 자료 추출
				int id = rs.getInt("id");
				String name = rs.getString("name");
				int price = rs.getInt("price");
				int maker = rs.getInt("maker_makerid");
				int category = rs.getInt("category_catid");
				System.out.println("|"+id +"|"+ name + "|"+price + "|" + maker + "|" + category);
			}
			System.out.println("|_______________________________________|");
			//4단계 - 종료(생성된 역순으로 객체를 해제함)
			rs.close();
			stmt.close();
			conn.close();
		} catch (ClassNotFoundException cnfe) {
			System.out.println("클래스를 찾을 수 없습니다.");
		}catch(SQLException se) {
			System.out.println(se.getMessage());
		}
	
	}
}
