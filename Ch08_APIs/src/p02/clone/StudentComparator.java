package p02.clone;

import java.util.Comparator;

/**[API]
 * -.일반객체를 비교할 수 있도록 래핑해주는 객체 생성(Comparator<>인터페이스를 구현한 객체를 생성, <>은 비교할 객체만 대입되도록 타입을 제한한 형 제한자) 
 **/
public class StudentComparator implements Comparator<Student>{
	@Override
	public int compare(Student o1, Student o2) {
		/*if(o1.sno < o2.sno) { //앞의 값이 적으면 -1
			return -1;
		}else if(o1.sno == o2.sno) { //값이 같으면 0
			return 0;
		}else { //뒤의 값이 적으면 1
		return 1;
		}*/
		return Integer.compare(o1.sno, o2.sno); //이렇게 사용해도 됨.. 같은내용
	}
	
}
