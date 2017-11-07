package p09.interfaces;
/** [인터페이스]
 * -.인터페이스의 상속
 **/
public interface InterE1 {
	public void aa(); //추상메소드
}
//인터페이스의 상속
interface E2 extends InterE1 {
	//public void aa(); //안보이지만 있는것과 마찬가지
	public void bb();//추상메소드 추가
}
interface E3 extends E2{
	//public void aa(); //안보이지만 있는것과 마찬가지
	//public void bb(); //안보이지만 있는것과 마찬가지
	public void cc(); //추상메소드 추가
}
 
class C4 implements E3 { //E3 인터페이스를 implements 했음,E1, E2것도 나옴

	@Override
	public void bb() {
		System.out.println("E2메소드");
	}

	@Override
	public void aa() {
		System.out.println("E1메소드");
	}

	@Override
	public void cc() {
		System.out.println("E3메소드");
	}
	
}
