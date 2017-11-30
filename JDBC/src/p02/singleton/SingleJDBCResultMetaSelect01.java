package p02.singleton;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;

/**[JDBC]
 * -. MetaData: 실제 Data의 정보(타입, 길이 등의 정보)를 가진 데이터
 **/
public class SingleJDBCResultMetaSelect01 {
	public static void main(String[] args) {
		//Connection
		Connection conn = null;
		//Statement
		Statement stmt = null;
		//ResultSet
		ResultSet rs = null;
		ResultSetMetaData rsm = null;
		try {
			conn = Connections.getInstance().getConnection();
			stmt = conn.createStatement();
			rs = stmt.executeQuery("select * from goods");
			rsm = rs.getMetaData();
			//헤드출력용도로 메타데이터 사용
			for(int i = 1; i<rsm.getColumnCount();i++) {
				System.out.print(rsm.getColumnName(i)+"\t");
			}
			System.out.println();
			while(rs.next()) {
//				for (int i = 1; i<rsm.getColumnCount();i++) {
					System.out.println(rs.getInt(1)+"\t"+rs.getString(2)+"\t" + rs.getInt(3));
//				}
			}
			rs.close();
			stmt.close();
			conn.close();
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
