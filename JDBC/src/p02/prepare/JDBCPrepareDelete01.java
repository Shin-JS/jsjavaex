package p02.prepare;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.util.Scanner;

/**[JDBC]
 * -.insert/update/delete executeUpdate();
 * executeUpdate()메소드는 반영된 행(row)수를 리턴함
 * delete
 **/
public class JDBCPrepareDelete01 {
	public static void main(String[] args) {
		//Connection
		Connection conn = null;
		//PrepareStatemnet
		PreparedStatement pstmt = null;
		//쿼리문
		String sql = "delete from board where no = ?";
		//접속정보
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
			System.out.print("삭제할 글번호 입력: ");
			int no = scanner.nextInt();
			System.out.print("정말로 삭제하시겠습니까? ");
			char c = scanner.next().charAt(0);
			if(c=='y'||c=='Y') {
				pstmt.setInt(1, no);
				int result = pstmt.executeUpdate(); //insert/update/delete 는 executeUpdate(); 사용
				if(result > 0) {
					System.out.println("삭제성공");
				}else {
					System.out.println("삭제 실패");
				}
			}else {
				System.out.println("삭제하지 않습니다.");
			}
			//4단계
			pstmt.close();
			conn.close();
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
