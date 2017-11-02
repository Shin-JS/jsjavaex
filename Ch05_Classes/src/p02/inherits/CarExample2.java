package p02.inherits;
/** [상속](다형성?)
 *  객체의 다형성(polymorphism)
 *  
 **/
public class CarExample2 {
	public static void main(String[] args) {
		Car[] car = new Car[4];
		
		Car car1 = new Car();
		Bus bus = new Bus();
		Ambulance ambulance = new Ambulance();
		FireEngine fireEngine = new FireEngine();
		//최상위 부모객체를 상속받은 자식객체들은 최상위 부모객체 참조변수에 대입가능하다.
		car[0] = car1;
		car[1] = bus;
		car[2] = ambulance;
		car[3] = fireEngine;
		
		/*for (Car c:car) { 향상된 for문(for each)
			System.out.println(c.a);
			c.move();
		if (c instanceof Ambulance) {
			Ambulance am = (Ambulance)c;
			am.special();
		}
		}*/
		//move()라는 메소드는 이름은 동일하지만 속한 객체에 다라 실행결과가 달라짐 - 메소드의 다형성
		for (int i =0; i<car.length; i++) {
			car[i].move(); //메소드의 다형성
			System.out.println(car[i].a);
			/* 자식 객체들이 부모객체인 Car타입으로
			 * 자동 형변환되어 본인의 필드값으로 접근이 안됨.
			 * 굳이 자식객체들의 a값을 받을려면 강제형변환 시켜야함
			 * 다만 override된 메소드는 override된 결과로 출력가능
			 */
		if (car[i] instanceof Ambulance) { //casting가능한지 판별하는 게 instanceof, 
			Ambulance am = (Ambulance)car[i];
			am.special();
		}
		}
		
	}
}
