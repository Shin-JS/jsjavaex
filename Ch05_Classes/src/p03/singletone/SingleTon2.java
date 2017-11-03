/**
 * 클래스의 경로명 src\p03\singletone\SingleTon2.class
 **/
package p03.singletone;
/** [싱글톤]
 * 
 **/
public class SingleTon2 {
	//필드
	private static SingleTon2 instance;
	private SingleTon2() {}
	public static SingleTon2 getInstance() {
		if(instance!=null) {
			instance = new SingleTon2();
		}
		return instance;
	}
}
