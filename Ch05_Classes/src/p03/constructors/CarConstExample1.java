package p03.constructors;
/** [생성자]
 *  생성자의 오버로딩
 *  -.생성자 예시: 클래스명(타입 변수,........)(←signature라고함.. 생성자 고유의 형태){}
 *  -.생성자의 이름은 동일하고 매개변수의 타입과 갯수순서가 다른 형태
 **/
public class CarConstExample1 {
	public static void main(String[] args) {
		Car car1 = new Car(); //instance생성
		Car car2 = new Car("현대자동차"); //매개변수 1개인 instance생성
		Car car3 = new Car("현대자동차","소나타"); //매개변수 2개인 instance생성
		Car car4 = new Car("현대자동차", "소나타", 350); //매개변수 3개인 instance생성
		Car car5 = new Car("현대자동차", "소나타", 350, 2017); //매개변수 4개인 instance생성
		
		Car[] car = new Car[5];
		
		car[0] = car1;
		car[1] = car2;
		car[2] = car3;
		car[3] = car4;
		car[4] = car5;
		
		for (int i = 0; i < car.length;i++) {
			System.out.println((i+1)+":"+car[i].company+":"+car[i].model+":"+car[i].maxSpeed+":"+car[i].productYear);
		}
		System.out.println("----------------------------------------");
		car1.company = "현대자동차";
		car1.model = "그랜저";
		car1.maxSpeed = 450;
		car1.productYear = 2018;
		
		car2.model = "그랜저";
		car2.maxSpeed = 450;
		car2.productYear = 2018;
		
		car3.maxSpeed = 350;
		car3.productYear = 2018;
		
		car4.productYear = 2018;
		/*
		car[0] = car1;
		car[1] = car2;
		car[2] = car3;
		car[3] = car4;
		car[4] = car5;*///굳이 할 필요없음
		
		for (int i = 0; i < car.length;i++) {
			System.out.println((i+1)+":"+car[i].company+":"+car[i].model+":"+car[i].maxSpeed+":"+car[i].productYear);
		}
		
	}
}
