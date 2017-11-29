package p01.jdbc;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Scanner;

/**[JDBC]
 *  쿼리문 사용
 **/
public class JDBCSelect04 {
	public static void main(String[] args) {
		Scanner scanner = new Scanner(System.in);
		//Connection 객체
		Connection conn = null;
		//Statement객체
		Statement stmt = null;
		//ResultSet객체
		ResultSet rs = null;
		System.out.print("상품코드를 입력하세요: ");
		int goodsid = scanner.nextInt();
		//쿼리문
		String sql = "select * from goods where id =" + goodsid+";";
		System.out.println(sql);
		try {
			//1단계 - 로딩
			Class.forName("com.mysql.jdbc.Driver");
			//2단계 - 연결
			conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/mydatabase11", "user01", "user01");
			//3단계 - 실행
			stmt = conn.createStatement();
			rs = stmt.executeQuery(sql);
			while(rs.next()) {
				//getInt("칼럼명")에서 칼럼명 대신 인덱스번호로 넣어도 가능
				int id = rs.getInt("id");
				String name = rs.getString("name");
				int makeride = rs.getInt("maker_makerid");
				int price = rs.getInt("price");
				int catid = rs.getInt("category_catid");
				System.out.println("|"+id+"|"+name+"|"+makeride+"|"+price+"|"+catid);
			}
			//4단계 - 자원해제
			rs.close();
			stmt.close();
			conn.close();
		} catch (ClassNotFoundException cnfe) {
			System.out.println("class not found exception");
		}catch(SQLException se) {
			System.out.println(se.getMessage());
		}
	}
}
