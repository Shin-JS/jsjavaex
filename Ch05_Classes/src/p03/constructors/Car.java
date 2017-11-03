package p03.constructors;
/**[생성자(Constructor)]
 * 클래스 구성의 3요소: 필드, 생성자, 메소드
 * -.생성자 오버로딩: 동일한 이름의 생성자를 여러개 만드는것(조건: 매개변수의 타입과 갯수가 달라야 한다.)
 * -.this()메소드: 동일 클래스 내에서 다른 생성자를 호출하는 메소드, 반드시 실행부의 첫줄에 기술되어야함
 * -. 생성자를 여러개 만들어 사용하는 이유: 객체를 만들기 위한 초기 데이터의 갯수가 달라질 수 있는 상황
 **/
public class Car {
	//필드(멤버변수, 전역변수): 클래스의 고유속성, 현재상태, 부품객체를 저장하는 역할
	String company; //고유속성
	String model; //고유속성
	int maxSpeed; //고유속성
	int productYear; //고유속성
	int currentSpeed; //현재상태
	boolean engineStart; //현재상태
	//생성자: 생성자는 클래스명과 같은 이름을 가진 메소드이며, 리턴타입 키워드가 없다.
	//		  생성자의 역할은 필드들의 값을 초기화하는 역할
	Car(){} //매개변수가 없는 default생성자
	Car(String company){
		this.company = company;
	} //매개변수 1개짜리
	Car(String company,String model){
		this(company); //매개변수 1개짜리 생성자를 호출, 반드시 첫줄에 위치해야함
//		this.company = company;
		this.model = model;
	}//매개변수 2개짜리
	Car(String company,String model,int maxSpeed){
		this(company, model); //매개변수 2개짜리 생성자를 호출, 반드시 첫줄에 위치해야함
//		this.company = company;
//		this.model = model;
		this.maxSpeed = maxSpeed;
	}//매개변수 3개짜리
	Car(String company,String model,int maxSpeed,int productYear){
		this(company,model,maxSpeed); //매개변수 3개짜리 생성자를 호출, 반드시 첫줄에 위치해야함
//		this.company = company;
//		this.model = model;
//		this.maxSpeed = maxSpeed;
		this.productYear = productYear;
	}//매개변수 4개짜리
	
	//메소드
	void speedup(int speed) {
		if(engineStart==false) {
			engineStart = true;
		}
		currentSpeed += speed;
	}
	void speeddown(int speed) {
		if (currentSpeed - speed < 0 ) {
			currentSpeed = 0;
		}
		currentSpeed -= speed;
	}
	void stop() {
		currentSpeed = 0;
		engineStart = false;
	}
}
