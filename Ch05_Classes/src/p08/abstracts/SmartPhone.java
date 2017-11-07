package p08.abstracts;
/**[추상클래스]
 * 
 **/
public class SmartPhone extends Phone {
	//추상클래스도 클래스이므로 반드시 생성자가 있어야 한다.
	//기본생성자가 없으면 컴파일시 자동 추가됨.
	//생성된 자식의 생성자에서 부모생성자호출은 super()메소드를 이용하여 호출
	public SmartPhone(String owner) {
		super(owner); //super()메소드는 반드시 첫줄에 위치해야함

	}
	//메소드
	//클래스의 상속처럼 자식클래스에서 필요한 메소드를 추가 할 수 있다.
	//Phone p = new SmartPhone(); //프로모션
	//p.internetSearch() → 사용불가(부모타입에는 해당 메소드가 없다)
	public void internetSearch() {
		System.out.println("인터넷 서핑...");
	}

}
