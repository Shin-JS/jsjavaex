package p09.ploymorph;
/**
 * 인터페이스가 있는 경우, 
 * -.응집도: 같은 클래스내에서 멤버변수와 메소드사이의 관계를 말함, 
 *           즉, 응집도가 높으면 관계가 서로 잘 엮여있다.
 * -.결합도: 두 클래스간의 관계, 객체지향 프로그램에서 결합도는 느슨해야 한다.(loosely coupled)
 * A클래스가 B클래스를 사용관계라면 A가B에 의존
 * A와 B의 관계를 느슨하게 하려면(즉, 결합도를 낮추려면)인터페이스를 이용하여 관계를 맺는다.
 * 
 **/
public class Inter5 {
	public static void main(String[] args) {
		//객체 생성
		H1 h1 = new H1();
		H2 h2 = new H2();
		Test test = new Test();
		test.autoPlay(h1);
		test.autoPlay(h2);
	}
}

interface I{
	void play(); //추상메소드 메소드를 호출하는 방식은 매개변수 없이 호출
}

class Test {
	void autoPlay(I i) { //메소드의 배개변수로 인터페이스를 받음
		i.play();
	}
}

class H1 implements I {

	@Override
	public void play() {
		System.out.println("A메소드");
	}
	
}
class H2 implements I {

	@Override
	public void play() {
		System.out.println("B메소드");
	}
	
}