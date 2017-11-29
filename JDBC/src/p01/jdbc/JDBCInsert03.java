package p01.jdbc;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Scanner;

/**[JDBC]
 * -.insert/update/delete executeUpdate();
 * executeUpdate()메소드는 반영된 행(row)수를 리턴함
 **/
public class JDBCInsert03 {
	public static void main(String[] args) {
		//Connection 얻기
		Connection conn = null;
		//Statement
		Statement stmt = null;
		//접속경로
		String url = "jdbc:mysql://localhost:3306/mydatabase11";
		String user = "user01";
		String password = "user01";
		//쿼리문
		String sql = "";
		String MaxValQuery = "select max(no) from board;"; //글번호 최대값을 불러오는 쿼리문
		int maxNo = 0;
		String sql2 = "select * from board where no="+maxNo+";";
		ResultSet rs = null; //최대글번호, 쿼리결과
		Scanner scanner = new Scanner(System.in);
		try {
			Class.forName("com.mysql.jdbc.Driver");
			conn = DriverManager.getConnection(url, user, password);
			//게시글 최대번호
			stmt = conn.createStatement();
			rs = stmt.executeQuery(MaxValQuery);
			if(rs.next()) {
				maxNo = rs.getInt(1)+1;

			}
			rs.close();//
			sql2 = "select * from board where no="+maxNo+";";
			//입력처리
			System.out.print("제목 입력: ");
			String title = scanner.next();
			System.out.print("내용 입력: ");
			String content = scanner.next();
			System.out.print("작성자 입력: ");
			String writer = scanner.next();
			//
			sql = "insert into board(no,title,content,writer) values("+maxNo+",'"+title+"',"+"'"+content+"'"+",'"+writer+"');";
			System.out.println(sql);
			int result = stmt.executeUpdate(sql); //반영된 데이터의 행(row) 수를 리턴해줌
			if(result >0) {
				System.out.println("저장이 완료되었습니다.");
				System.out.println(sql2);
				rs = stmt.executeQuery(sql2); //쿼리결과는 한건
				rs.next(); //←시작이 0부터
				System.out.println("글번호 제목 내용 작성자 ");
				System.out.println(rs.getInt(1)+" " + rs.getString(2)+ " " + rs.getString(3) + " " + rs.getString(4));

			}else {
				System.out.println("저장을 실패했습니다.");
			}
			rs.close();
			stmt.close();
			conn.close();
			
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
	
}
/*
 * insert into goods(id,name,price,maker_makerid,category_catid) values(1007,'휴대용방석',5000,7001,2);
 */