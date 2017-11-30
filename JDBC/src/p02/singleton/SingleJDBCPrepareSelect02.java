package p02.singleton;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**[JDBC]
 * scrollable ResultSet: 쿼리의 결과를 위/아래 커서를 이동하여 출력할 수 있는객체
 **/
public class SingleJDBCPrepareSelect02 {
	public static void main(String[] args) {
		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		String sql = "select * from goods";
		try {
			conn = Connections.getInstance().getConnection();
			pstmt = conn.prepareStatement(sql, ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_UPDATABLE);
			rs = pstmt.executeQuery();
			System.out.println("next()---------------");
			while(rs.next()) {
				System.out.println("no: " + rs.getInt(1)+", name: " + rs.getString(2) + ", price: "+ rs.getInt(3));
			}
			System.out.println("previous()-------------");
			while(rs.previous()) { //역순 출력
				System.out.println("no: " + rs.getInt(1)+", name: " + rs.getString(2) + ", price: "+ rs.getInt(3));
			}
			System.out.println("first()-------------");
			rs.first();
			System.out.println("no: " + rs.getInt(1)+", name: " + rs.getString(2) + ", price: "+ rs.getInt(3));
			System.out.println("last()-------------");
			rs.last();
			System.out.println("no: " + rs.getInt(1)+", name: " + rs.getString(2) + ", price: "+ rs.getInt(3));
			System.out.println("absolute(n)-------------");
			rs.absolute(5);
			System.out.println("no: " + rs.getInt(1)+", name: " + rs.getString(2) + ", price: "+ rs.getInt(3));
			
			
			rs.close();
			pstmt.close();
			conn.close();
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
