package p02.prepare;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Scanner;

/**[JDBC]
 * -.PrepareStatement: statement문과 다르게 바인딩변수를 사용한다.
 * 
 **/
public class JDBCPrepareSelect03 {
	public static void main(String[] args) {
		//Connection 객체
		Connection conn = null;
		//PrepareStatement객체
		PreparedStatement pstmt = null;;
		Statement stmt = null;
		//ResultSet
		ResultSet rs = null;
		//db접속정보
		String url = "jdbc:mysql://localhost:3306/mydatabase11";
		String user = "user01";
		String password = "user01";
		//쿼리문
		//바인딩되는 변수의 갯수만큼 '?'를 표시함.
		//바인딩순서는 '?' 순서
		String sql = "select * from board where title like ? and writer like ?";
		String sql2 = "";
		try {
			//1단계
			Class.forName("com.mysql.jdbc.Driver");
			//2단계
			conn = DriverManager.getConnection(url, user, password);
			//3단계
			pstmt = conn.prepareStatement(sql); //접속시에 쿼리문틀을 미리 만들어놓음(statement문은 쿼리문을 담을 객체만 만듬)
			String title = "%" + "글";
			String writer = "%" + "자";
			sql2 = "select * from board where title like '"+title+"' and writer like '" + writer + "'";
			stmt = conn.createStatement();
			pstmt.setString(1, title);
			pstmt.setString(2, writer); //바인딩변수 '?'와 실제변수값을 매칭시키는 작업
			rs = pstmt.executeQuery();//실행시는 만들어진(실제 변수값이 바인딩된) 쿼리를 실행 (statement문은 실행시 완성된 쿼리를 실행)
			while(rs.next()) {
				System.out.println("제목: " + rs.getString(1) + " 내용: " + rs.getString(2) + " 작성자: " + rs.getString(3));
			}
			rs.close();
			rs = stmt.executeQuery(sql2);
			System.out.println(sql2);
			while(rs.next()) {
				System.out.println("제목: " + rs.getString(1) + " 내용: " + rs.getString(2) + " 작성자: " + rs.getString(3));
			}
			rs.close();
			pstmt.close();
			conn.close();
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		
	}
}
