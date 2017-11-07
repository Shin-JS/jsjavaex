package p08.employees;
/**[추상클래스를 활용한 예제]
 *  -.급여계산용 프로그램
 **/
public class EmployeeExample1 {
	public static void main(String[] args) {
		//객체생성
		//추상클래스의 배열은 생성가능
		// new Employee() 객체생성은 불가능
		Employee[] emp = new Employee[5];
		//객체의 다형성을 이용한 배열 저장
		emp[0] = new SalaryMan("고길동", 200000);
		emp[1] = new SalaryMan("둘리", 500000);
		emp[2] = new HourlyMan("도우너", 10, 7000);
		emp[3] = new HourlyMan("또치",2,7000);
		emp[4] = new SalaryMan("마이콜", 2000000);
		//반복자를 이용한 향상된 for문(for-each)
		for(Employee e:emp) { //배열내의 요소들이 Promotion되어있는 상태, 
			e.computeIncetive(); //보너스 구하기
			e.print(); //출력
			//시급인 경우 근무시간과 시급 출력하기
			if (e instanceof HourlyMan) { //instanceof→Casting가능여부 확인
				//자식객체에서 추가된 메소드는 부모타입에서 사용불가, 사용하기 위해서는 자식타입으로Casting(강제형변환)해줘야함
				System.out.print(e.getName()+"님,");
				System.out.print("근무시간: "+((HourlyMan) e).getHour()+"\t");  //Promotion이 되어있기때문에 Casting해줘야함
				System.out.println("시급: " + ((HourlyMan) e).getPerHour());
			}
		}
		
	}
}
