package p03.prepareGui;

import java.io.FileReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;

/**
 * 하나의 객체를 공유하여 사용, 데이터 접속의 일관성 유지
 * Connections conn1 = DriverManager.getConnection();
 * Connections conn2 = DriverManager.getConnection();
 **/
public class Connections {
	//필드: private static 자신타입 필드명;
	private static Connections instance;
	//생성자: private 생성자(){}
	private Connections() {}
	//메소드: public static 자신타입 getInstance(){}
	public static Connections getInstance() {
		if(instance==null) {
			instance = new Connections();
		} //혹시 객체가 없을수도 있으니..
		return instance;
	}
	public Connection getConnection() {
		Connection conn = null;
		//프로버티 객체: 키와값이 문자열로 한정된 map
		Properties prop = new Properties();
		//상대경로로 파일 읽기
		String path = Connections.class.getResource("database.properties").getPath();
		try {
			prop.load(new FileReader(path)); //상대경로로 부터 자료 읽기
			String driver = prop.getProperty("driver");
			String user = prop.getProperty("user");
			String url = prop.getProperty("url");
			String password = prop.getProperty("password");
			Class.forName(driver);
			conn = DriverManager.getConnection(url, user, password);
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		return conn;
	}
	
}
