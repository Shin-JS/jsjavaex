package p09.interfaces;
/** [인터페이스]
 * -.인터페이스의 상속
 **/
public interface Inter1 {
	int a = 3; //앞에 public static final이 생략됨
	void display(); //앞에 public이 생략됨
	public void print();
}

class D1 implements Inter1 {

	@Override
	public void display() {
		System.out.println("구현체 D1");
	}

	@Override
	public void print() {
		System.out.println("구현체 D1의 print");
	}
}

class D2 extends D1 {
	@Override
	public void display() { //interface를 구현한 구현체도 상속후 메소드 재정의가 가능하다
		System.out.println("D1을 상속받은 D2");
	}
	@Override
	public void print() {
		System.out.println("D1을 상속받은 D2의 print");
	}
}