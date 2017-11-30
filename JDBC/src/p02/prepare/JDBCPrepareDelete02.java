package p02.prepare;

import java.io.FileReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.util.Properties;
import java.util.Scanner;

/**[JDBC]
 * -.insert/update/delete executeUpdate();
 * executeUpdate()메소드는 반영된 행(row)수를 리턴함
 * delete
 **/
public class JDBCPrepareDelete02 {
	public static void main(String[] args) {
		//Connection
		Connection conn = null;
		//PrepareStatemnet;
		PreparedStatement pstmt = null;
		Properties prop = new Properties();
		String path = JDBCPrepareDelete02.class.getResource("database.properties").getPath();
		String sql = "update member set flag = 'n' where no =?";
		try {
			//1단계
			prop.load(new FileReader(path));
			String driver = prop.getProperty("driver");
			String url = prop.getProperty("url");
			String user = prop.getProperty("user");
			String password = prop.getProperty("password");
			Class.forName(driver);
			//2단계
			conn = DriverManager.getConnection(url, user, password);
			//3단계
			pstmt = conn.prepareStatement(sql);
			Scanner scanner = new Scanner(System.in);
			System.out.print("탈퇴할 회원번호 입력: ");
			int no = scanner.nextInt();
			pstmt.setInt(1, no);
			int result = pstmt.executeUpdate();
			if(result>0) {
				System.out.println("탈퇴완료");
			}else {
				System.out.println("탈퇴실패");
			}
			//4단계
			pstmt.close();
			conn.close();
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
