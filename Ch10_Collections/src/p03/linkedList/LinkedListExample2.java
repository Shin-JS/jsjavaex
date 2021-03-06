package p03.linkedList;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

/**[List 컬렉션]
 * LinkedList
 * 자료 추가
 **/
public class LinkedListExample2 {
	public static void main(String[] args) {
		List<String> list1 = new ArrayList<>(); //배열타입의 리스트
		List<String> list2 = new LinkedList<>(); //연결타입의 리스트
		
		long startTime;
		long endTime;
		startTime = System.nanoTime(); //time-stamp
		for(int i = 0; i<1000000; i++) {
			list1.add(String.valueOf(i)); //"1","2","3"......
		}
		endTime = System.nanoTime(); //time-stamp
		System.out.println("ArraysList 걸린시간: " + (endTime-startTime)+"ns");
		
		startTime = System.nanoTime(); //time-stamp
		for(int i = 0; i<1000000; i++) {
			list2.add(String.valueOf(i)); //"1","2","3"......
		}
		endTime = System.nanoTime(); //time-stamp
		System.out.println("LinkedList 걸린시간: " + (endTime-startTime)+"ns");
	}
}
