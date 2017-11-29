package p01.jdbc;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Scanner;

/**[JDBC]
 * -.insert/update/delete executeUpdate();
 * executeUpdate()메소드는 반영된 행(row)수를 리턴함
 * delete
 **/
public class JDBCDelete01 {
	public static void main(String[] args) {
		//connection
		Connection conn = null;
		//statement
		Statement stmt = null;
		//ResultSet
		ResultSet rs = null;
		//연결정보
		String url = "jdbc:mysql://localhost:3306/mydatabase11";
		String user = "user01";
		String password = "user01";
		//쿼리문
		int no = 0;
		String sql = "";
		Scanner scanner = new Scanner(System.in);
		try {
			Class.forName("com.mysql.jdbc.Driver");
			conn = DriverManager.getConnection(url,user,password);
			stmt = conn.createStatement();
			System.out.print("삭제할 글 번호 입력: ");
			no = scanner.nextInt();
			System.out.print("정말로 삭제하시겠습니까?");
			if(scanner.next().charAt(0)=='y'||scanner.next().charAt(0)=='Y') {
				sql = "delete from board where no=" + no;
				int result = stmt.executeUpdate(sql);//삭제된 행 리턴
				if(result >0) {
					System.out.println("삭제완료");
					rs = stmt.executeQuery("select * from board");
					while(rs.next()) {
						System.out.println(rs.getInt(1)+"|" + rs.getString(2)+"|"+rs.getString(4)+"|");
					}
				}else {
					System.out.println("삭제실패");
				}
			}
			rs.close();
			stmt.close();
			conn.close();
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
