package p06.treeset;

import java.util.NavigableSet;
import java.util.TreeSet;

/**[2진트리]
 * 	NavigableSet
 **/
public class TreeSetExample2 {
	public static void main(String[] args) {
		TreeSet<Integer> scores = new TreeSet<>();
		scores.add(new Integer(87));
		scores.add(98); //auto-boxing
		scores.add(new Integer(75));
		scores.add(new Integer(95));
		scores.add(80); //auto-boxing
		//TreeSet의 저장된 객체를 오름차순, 내림차순으로 정렬해서 출력하는 방법
		NavigableSet<Integer> descendingSet = scores.descendingSet(); //내림차순으로 변경
		for(Integer score:descendingSet) {
			System.out.print(score+"\t");
		}
		System.out.println();
		//내림차순으로 정렬된 객체를 오름차순으로 재정렬
		NavigableSet<Integer> ascendingSet = descendingSet.descendingSet();
		for(Integer score:ascendingSet) {
			System.out.print(score+"\t");
		}
		System.out.println();
		
	}
}
