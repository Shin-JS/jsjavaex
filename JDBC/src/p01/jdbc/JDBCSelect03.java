package p01.jdbc;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**[JDBC]
 *  쿼리문 사용
 **/
public class JDBCSelect03 {
	public static void main(String[] args) {
		//Connection 객체
		Connection conn = null;
		//Statement객체
		Statement stmt = null;
		//ResultSet객체
		ResultSet rs = null;
		String goodsname = "새우깡";
		//쿼리문
		String sql = "select goods.id as id, goods.name as goodsname, makername, price , qty, date" + 
				"	from maker,goods," + 
				"		stock" + 
				"	where goods.id = stock.goods_id" + 
				"    and goods.maker_makerid=maker.makerid"+
				" and goods.name = "+"'"+goodsname+"'"+";";
		System.out.println(sql);
		try {
			//1단계 - 로딩
			Class.forName("com.mysql.jdbc.Driver");
			//2단계 - 연결
			conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/mydatabase11", "user01", "user01");
			//3단계 - 실행
			stmt = conn.createStatement();
			rs = stmt.executeQuery(sql);
			while(rs.next()) {
				int id = rs.getInt("id");
				String name = rs.getString("goodsname");
				String makername = rs.getString("makername");
				int price = rs.getInt("price");
				int qty = rs.getInt("qty");
				System.out.println("|"+id+"|"+name+"|"+makername+"|"+price+"|"+qty);
			}
			//4단계 - 자원해제
			rs.close();
			stmt.close();
			conn.close();
		} catch (ClassNotFoundException cnfe) {
			System.out.println("class not found exception");
		}catch(SQLException se) {
			System.out.println(se.getMessage());
		}
	}
}
