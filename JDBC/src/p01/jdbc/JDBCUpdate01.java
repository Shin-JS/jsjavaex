package p01.jdbc;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Scanner;

/**[JDBC]
 * -.insert/update/delete executeUpdate();
 * executeUpdate()메소드는 반영된 행(row)수를 리턴함
 * insert
 **/
public class JDBCUpdate01 {
	public static void main(String[] args) {
		//connection
		Connection conn = null;
		//쿼리객체
		Statement stmt = null;
		//ResultSet객체
		ResultSet rs = null;
		//쿼리문
		int count =0;
		int fcount = 0;
		int no = 0;
		//url, user, password
		String url = "jdbc:mysql://localhost:3306/mydatabase11";
		String user = "user01";
		String password = "user01";
		Scanner scanner = new Scanner(System.in);
		String sql = "";	
		try {
			//로드
			Class.forName("com.mysql.jdbc.Driver");
			//연결
			conn = DriverManager.getConnection(url,user,password);
			System.out.print("글 번호 입력: ");
			no = scanner.nextInt();
			System.out.print("읽은 횟수 입력: ");
			count = scanner.nextInt();
			System.out.print("좋아요 횟수: ");
			fcount = scanner.nextInt();
			sql = "update board set readcount ="+count+",favor ="+fcount+" where no ="+no+";";
			//작업
			stmt = conn.createStatement();
			int result = stmt.executeUpdate(sql); //반영된 행의 수 반환
			if(result > 0) {
				System.out.println("수정완료");
				rs = stmt.executeQuery("select no,title,readcount,favor from board where no = "+no);
				if(rs.next()) {
					System.out.println(rs.getInt(1) +"|"+ rs.getString(2)+"|"+rs.getInt(3)+"|"+rs.getInt(4)+"|");
				}
			}else {
				System.out.println("수정실패");
			}
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
