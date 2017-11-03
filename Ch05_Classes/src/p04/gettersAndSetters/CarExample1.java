package p04.gettersAndSetters;

public class CarExample1 {
	public static void main(String[] args) {
		Car myCar = new Car();
		myCar.setSpeed(-50); //입력오류(실행중 잘못된값이 들어간경우)
		
		System.out.println("현재속도: " + myCar.getSpeed());
		
		myCar.setSpeed(60); //정상입력
		System.out.println("현재속도: " + myCar.getSpeed());
		
		if(!myCar.isStop()) {
			myCar.setStop(true);
		}
		System.out.println("현재속도: " +myCar.getSpeed());
		
	}
}
