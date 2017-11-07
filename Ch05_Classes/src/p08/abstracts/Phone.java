package p08.abstracts;
/**[추상클래스]
 * -.추상클래스도 일반 메소드를 가질 수 있다.
 * -.추상클래스안에는 일반메소드, 추상메소드 둘 다 존재가능
 * -.상속받은 클래스에서 반드시 구현되어야하는 메소드는 추상메소드로 선언하고, 그 외에는 일반메소드로 선언
 **/
public abstract class Phone {
	// 필드
	public String owner;

	// 생성자
	public Phone(String owner) {
		this.owner = owner;
	}

	// 메소드
	public void turnOn() {
		System.out.println("전원을 켭니다.");
	}

	public void turnOff() {
		System.out.println("전원을 끕니다.");
	}
}
