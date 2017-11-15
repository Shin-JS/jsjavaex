package p02.clone;

import java.util.Objects;

/**[API]
 * -.Comparable인터페이스를 구현하지 않은 일반 클래스의 비교
 * -.Comparator인터페이스를 구현한 클래스를 하나 만들어서 두 객체를 비교 할 수 있는 메소드를 만들어서 비교하고 Object클래스의 compare메소드의 매개변수로
 *   Comparator구현체를 넘김
 **/
public class CompareExample {
	public static void main(String[] args) {
		Student s1 = new Student(1);
		Student s2 = new Student(1);
		Student s3 = new Student(2);
		
		int result = Objects.compare(s1, s2, new StudentComparator());
		int result1 = Objects.compare(s1, s3, new StudentComparator());
		System.out.println(result);
		System.out.println(result1);
	}
}
