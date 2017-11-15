package p03.systems;

import java.util.Properties;
import java.util.Set;

/**[API]
 * -.시스템의 속성값을 읽어내는 메소드 getProperty
 * -.시스템의 속성들은 property형태로 저장되어있음, (key:값)의 형태, key와 값이 문자열로 되어있는 자료구조
 **/
public class GetPropertyExample {
	public static void main(String[] args) {
		String osName = System.getProperty("os.name");
		String userName = System.getProperty("user.name");
		String userHome = System.getProperty("user.home");
		System.out.println("운영체제 이름: "+osName);
		System.out.println("사용자 이름: "+userName);
		System.out.println("사용자 홈디렉토리: "+userHome);
		System.out.println("-------------------------------------");
		System.out.println("[key]   value");
		System.out.println("-------------------------------------");
		//프로퍼티 객체 생성
		//getProperties()메소드는 system속성들을 Properties형태로 출력하는 메소드(key:value)
		Properties props = System.getProperties();
		//Set 자료구조
		//순서는 없지만 중복을 허용하지 않는 자료구조
		//Key의 속성: unique(다른 값과 구분이 되는 식별자 역할)
		Set keys = props.keySet();
		for(Object objkey:keys) { //외부 반복자
			String key = (String)objkey;
			String value = System.getProperty(key);
			System.out.println("["+key+"]"+value);
			
		}
	}
}
