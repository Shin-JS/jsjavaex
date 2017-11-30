package p02.prepare;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.util.Scanner;

/**[JDBC]
 * -.PrepareStatement: statement문과 다르게 바인딩변수를 사용한다.
 * 
 **/
public class JDBCPrepareInsert01 {
	public static void main(String[] args) {
		//Connection
		Connection conn = null;
		//PrepareStatemnet
		PreparedStatement pstmt = null;
		//sql
		String sql = "insert into goods(id,name,price,maker_makerid,category_catid) values(?,?,?,?,?)";
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
			int id = 1010;
			String name = "너구리";
			int price = 1500;
			int maker = 5001;
			int category = 1;
			Scanner scanner = new Scanner(System.in);
			System.out.println("값 입력");
			System.out.print("상품코드: ");
			id = scanner.nextInt();
			System.out.print("상품명: ");
			name = scanner.next();
			System.out.print("가격: ");
			price = scanner.nextInt();
			System.out.print("제조사: ");
			maker = scanner.nextInt();
			System.out.print("카테고리: ");
			category = scanner.nextInt();
			pstmt.setInt(1, id);
			pstmt.setString(2, name);
			pstmt.setInt(3, price);
			pstmt.setInt(4, maker);
			pstmt.setInt(5, category);
			int result = pstmt.executeUpdate(); //실행한 행(row)수를 반환
			System.out.println(result);
			if(result > 0) {
				System.out.println("입력성공");
			}else {
				System.out.println("입력실패");
			}
			
			
			//4단계
			pstmt.close();
			conn.close();	
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
