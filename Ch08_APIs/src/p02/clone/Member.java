package p02.clone;

import java.util.Arrays;

/**[API]
 *  객체의 복제는 Cloneable인터페이스로 구현된 객체만 복제 가능함
 **/
public class Member /*extends Object(있으나 없으나...)*/implements Cloneable{
	//필드
	public String name; //String타입 필드
	public int age; //기본타입 필드
	public int[] scores; //Array타입 필드
	public Car car; //객체타입(Car) 필드
	//생성자 - 필드의 초기화
	public Member(String name, int age, int[] scores, Car car) {
		this.name = name;
		this.age = age;
		this.scores = scores;
		this.car = car;
	}
	
	//메소드
	@Override
	protected Object clone() throws CloneNotSupportedException {
		//얕은 복사(clone()메소드: 원본의 내용이 그대로 복사,)
		//기본데이터 타입은 실제값이 복사, 참조 데이터 타입은 객체의 주소값이 복사(원본과 복사본이 같은 객체를 공유하게됨)
		//복사본의 객체를 수정하면 원본의 객체도 수정되어서 복제가 무의미해짐. 그래서, 객체가 멤버인경우는 객체의 껍데기를 새로 만들어서 내용을 다시 
		//복제하는 깊은 복제 작업을 해주어야 서로 다른 객체가 됨
		Member cloned = (Member)/*강제형변환(Casting)*/super.clone(); //clone()메소드의 리턴값은 Object이므로 Member타입으로 Casting하여 대입
		//scores를 복제
		cloned.scores = Arrays.copyOf(this.scores,this.scores.length); //copyOf(소스, 복사할 길이): 값을 복제하여 넘김
		//car복제
		cloned.car = new Car(this.car.model); //새로운 객체를 생성하여 생성자의 매개변수로 값을 넘김
		//깊은 복제된 Member객체를 리턴
		return cloned;
	} 
	public Member getMember() {
		Member cloned = null;
		try {
			cloned = (Member)clone(); //getMember()메소드에서 위에서 정의한 clone() 메소드를 호출
		}catch(CloneNotSupportedException e) {
			System.out.println(e.getMessage());
		}
		return cloned;
	}//메소드 끝
}

