package p03.singletone;
/** [싱글톤]
 * -.Singletone 방식: 객체의 생성을 막고 하나의 instance만 생성하여 필요시 사용하고 되돌려주는 방식의 클래스생성운영방식 (몹시 중요하다고 함)
 **/
public class SingleTon {
	//필드
	private static SingleTon instance = new SingleTon();
	private SingleTon() {} //생성자는 private로 접근제한이 되어있어서 외부에서 객체를 생성 불가능
	
	static SingleTon getInstance() {
		return instance;
	}
}
