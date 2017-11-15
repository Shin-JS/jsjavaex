package p01.objects;
/**[제네릭]
 * -.모든 타입의 객체를 다룰 수 있는 범용형태의 클래스(지금 아래에서 만든거..)
 **/
public class Box {
	//필드
	private Object object; //모든 타입이 대입 가능한 Object타입의 필드
	public void set(Object object) {
		this.object = object;
	}
	public Object get() {
		return object;
	}
}//클래스 끝
//Apple타입의 클래스
class Apple{
	
}
