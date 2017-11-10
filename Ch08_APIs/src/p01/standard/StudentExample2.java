package p01.standard;

import java.util.HashMap;

/**[API]
 *  <타입,타입>: 형 제한자
 **/
public class StudentExample2 {
	public static void main(String[] args) {
		//객체 생성
		//HashMap<객체, 객체> =>get(객체) -> 객체 리턴
		//int 타입에 Integer타입의 값이 대입.(Auto-unboxing)
		HashMap<Student, Integer> student = new HashMap<>();
		student.put(new Student("고길동", 1), 85); //put(객체, 객체)
		student.put(new Student("도우너", 2), 90); //int타입이 Integer타입으로 Promotion(Auto-boxing) 
		student.put(new Student("둘리", 3), 80);

		
		try {
		int score = student.get(new Student("고길동",1));
		System.out.println(score);
		}catch(NullPointerException e) {
			System.out.println("찾는 학생이 없음.");
		}
	}
}
