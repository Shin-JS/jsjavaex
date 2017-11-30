package p02.prepare;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.util.Scanner;

/**[JDBC]
 * -.insert/update/delete executeUpdate();
 * executeUpdate()메소드는 반영된 행(row)수를 리턴함
 * update
 **/
public class JDBCPrepareUpdate01 {
	public static void main(String[] args) {
		//Connection
		Connection conn = null;
		//PrepareStatement
		PreparedStatement pstmt = null;
		//쿼리문
		String sql = "update goods set name=?,price=? where id=?";
		//접속정보
		//DB정보 jdbc(프로토콜),mysql(sub프로토콜)
		String url = "jdbc:mysql://localhost:3306/mydatabase11";
		String user = "user01";
		String password = "user01";
		try {
			//1단계
			Class.forName("com.mysql.jdbc.Driver");
			//2단계
			conn = DriverManager.getConnection(url, user, password);
			//3단계
			pstmt = conn.prepareStatement(sql);
			Scanner scanner = new Scanner(System.in);
			System.out.print("변경할 상품명: ");
			String name = scanner.next();
			System.out.print("변경할 가격: ");
			int price = scanner.nextInt();
			System.out.print("변경할 상품의 코드: ");
			int id = scanner.nextInt();
			int i = 0;
			pstmt.setString(++i, name);
			pstmt.setInt(++i, price);
			pstmt.setInt(++i, id);
			int result = pstmt.executeUpdate();
			if(result > 0) {
				System.out.println("수정완료");
			}else {
				System.out.println("수정실패");
			}
			//4단계
			pstmt.close();
			conn.close();
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
