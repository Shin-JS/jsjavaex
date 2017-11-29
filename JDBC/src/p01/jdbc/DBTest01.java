package p01.jdbc;

import java.sql.Connection; //connection객체는 sql폴더에 있음
import java.sql.DriverManager;
import java.sql.SQLException;

/**[JDBC]
 *  DB연결
 **/
public class DBTest01 {
	public static void main(String[] args) {
		//연결객체 생성
		Connection conn = null;
		String url = "jdbc:mysql://localhost:3306/mydatabase11";
		String user = "user01";
		String password = "user01";
		try {
			Class.forName("com.mysql.jdbc.Driver"); //1단계-JDBC드라이버 로드
			conn = DriverManager.getConnection(url,user,password); //2단계-DB연결
			System.out.println("데이터베이스에 접속했습니다."); //3단계-작업
			conn.close(); //4단계-연결끊기
			System.out.println("접속을 종료합니다.");
		} catch (ClassNotFoundException cnfe) {
			System.out.println("해당 클래스를 찾을 수 없습니다.");
		} catch (SQLException se) {
			System.out.println(se.getMessage()); //sql오류메세지
			
		}
	}
}
