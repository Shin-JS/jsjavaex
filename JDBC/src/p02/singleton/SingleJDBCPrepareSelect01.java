package p02.singleton;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**[JDBC]
 * 싱글톤활용
 **/
public class SingleJDBCPrepareSelect01 {
	public static void main(String[] args) {
		//PrepareStatement
		PreparedStatement pstmt = null;
		//ResultSet
		ResultSet rs = null;
		//Connection
		Connection conn = null;
		try {
			conn = Connections.getInstance().getConnection();
			String sql = "select * from member where flag != 'n'";
			pstmt = conn.prepareStatement(sql);
			rs = pstmt.executeQuery();
			while(rs.next()) {
				int no = rs.getInt(1);
				String name = rs.getString(2);
				System.out.println(no+":"+name);
			}
			
			rs.close();
			pstmt.close();
			conn.close();
			
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
