package p09.interfaces;
/** [인터페이스]
 * -.인터페이스의 다중상속: 부모인터페이스가 2개이상인 인터페이스
 * -.두 부모의 추상메소드를 모두 물려받는다.
 **/
public interface F1 {
	void aa(); //추상메소드
}
interface F2 {
	void bb(); //추상메소드
}

//인터페이스의 다중상속
interface F3 extends F1,F2{
	//눈에는 안보이지만 aa();와 bb();가 모두 있다.
	void cc(); //추가
}
//다중상속받은 인터페이스의 구현체도 메소드 구현
class F4 implements F3 {

	@Override
	public void aa() {
		System.out.println("aa메소드");
	}

	@Override
	public void bb() {
		System.out.println("bb메소드");
	}

	@Override
	public void cc() {
		System.out.println("cc메소드");
	}
	
}
//두개 이상의 인터페이스로부터 구현한 구현체를 만들 수 있음
class F5 implements F1,F2{

	@Override
	public void bb() {
		System.out.println("F5 bb메소드");
	}

	@Override
	public void aa() {
		System.out.println("F5 aa메소드");
	}
	
}