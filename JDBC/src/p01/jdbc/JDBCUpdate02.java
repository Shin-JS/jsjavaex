package p01.jdbc;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Scanner;

/**[JDBC]
 * -.insert/update/delete executeUpdate();
 * executeUpdate()메소드는 반영된 행(row)수를 리턴함
 * update
 * 글번호만 입력받고 해당 글 번호의 readcount와 favor를 1씩 증가시킨 후 결과 출력
 **/
public class JDBCUpdate02 {
	public static void main(String[] args) {
		//connection
		Connection conn = null;
		//쿼리객체
		Statement stmt = null;
		//ResultSet객체
		ResultSet rs = null;
		//쿼리문
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
			//작업
			System.out.print("글 번호 입력: ");
			no = scanner.nextInt();
			stmt = conn.createStatement();
			sql = "update board set readcount=readcount+1,favor=favor+1 where no = "+no;
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
			rs.close();
			stmt.close();
			conn.close();
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
